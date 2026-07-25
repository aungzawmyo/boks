import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { shippingFeeFor, ShippingMethodId } from '@boks/configuration';
import { PrismaService } from '../prisma/prisma.service';
import { decimalToNumber } from '../common/utils';
import { CartService } from '../cart/cart.service';
import { PaymentsService } from './payments.service';

const orderInclude = {
  items: true,
  address: true,
  user: { select: { id: true, email: true, firstName: true, lastName: true } },
} satisfies Prisma.OrderInclude;

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: typeof orderInclude;
}>;

function orderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `BK-${stamp}${rand}`;
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cart: CartService,
    private payments: PaymentsService,
  ) {}

  private mapOrder(order: OrderWithRelations, opts: { admin?: boolean } = {}) {
    return {
      id: order.id,
      number: order.number,
      status: order.status,
      subtotal: decimalToNumber(order.subtotal),
      shippingFee: decimalToNumber(order.shippingFee),
      total: decimalToNumber(order.total),
      currency: order.currency,
      shippingMethod: order.shippingMethod,
      address: order.address
        ? {
            id: order.address.id,
            fullName: order.address.fullName,
            line1: order.address.line1,
            line2: order.address.line2,
            city: order.address.city,
            state: order.address.state,
            postalCode: order.address.postalCode,
            country: order.address.country,
            phone: order.address.phone,
            isDefault: order.address.isDefault,
          }
        : null,
      paymentProvider: order.paymentProvider,
      trackingNumber: order.trackingNumber,
      items: order.items.map((item) => ({
        id: item.id,
        bookId: item.bookId,
        title: item.title,
        slug: item.slug,
        format: item.format,
        unitPrice: decimalToNumber(item.unitPrice),
        quantity: item.quantity,
        lineTotal:
          Math.round(decimalToNumber(item.unitPrice) * item.quantity * 100) /
          100,
      })),
      paidAt: order.paidAt?.toISOString() ?? null,
      shippedAt: order.shippedAt?.toISOString() ?? null,
      deliveredAt: order.deliveredAt?.toISOString() ?? null,
      cancelledAt: order.cancelledAt?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
      customer: opts.admin
        ? {
            id: order.user.id,
            email: order.user.email,
            name: `${order.user.firstName} ${order.user.lastName}`,
          }
        : null,
    };
  }

  async checkout(
    userId: string,
    input: {
      addressId?: string | null;
      shippingMethod?: ShippingMethodId | null;
    },
  ) {
    const cart = await this.cart.assertNotEmpty(userId);

    if (cart.hasPhysicalItems) {
      if (!input.addressId) {
        throw new BadRequestException(
          'Shipping address is required for physical books',
        );
      }
      if (!input.shippingMethod) {
        throw new BadRequestException('Shipping method is required');
      }
      const address = await this.prisma.address.findFirst({
        where: { id: input.addressId, userId },
      });
      if (!address) throw new NotFoundException('Address not found');

      // Validate stock before creating the order
      for (const item of cart.items) {
        if (item.format !== 'PHYSICAL') continue;
        const stock = await this.prisma.inventory.aggregate({
          where: { bookId: item.bookId },
          _sum: { onHand: true },
        });
        if ((stock._sum.onHand ?? 0) < item.quantity) {
          throw new BadRequestException(
            `Not enough stock for "${item.title}"`,
          );
        }
      }
    }

    const shippingFee = cart.hasPhysicalItems
      ? shippingFeeFor(input.shippingMethod as ShippingMethodId, cart.subtotal)
      : 0;
    const total = Math.round((cart.subtotal + shippingFee) * 100) / 100;

    const order = await this.prisma.order.create({
      data: {
        number: orderNumber(),
        userId,
        status: OrderStatus.PENDING_PAYMENT,
        subtotal: cart.subtotal,
        shippingFee,
        total,
        shippingMethod: cart.hasPhysicalItems ? input.shippingMethod : null,
        addressId: cart.hasPhysicalItems ? input.addressId : null,
        paymentProvider: this.payments.provider,
        items: {
          create: cart.items.map((item) => ({
            bookFormatId: item.bookFormatId,
            bookId: item.bookId,
            title: item.title,
            slug: item.slug,
            format: item.format,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
          })),
        },
      },
      include: orderInclude,
    });

    const intent = await this.payments.createIntent({
      amount: total,
      currency: order.currency,
      orderId: order.id,
      orderNumber: order.number,
    });

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: { paymentIntentId: intent.intentId },
      include: orderInclude,
    });

    return {
      order: this.mapOrder(updated),
      payment: {
        provider: this.payments.provider,
        clientSecret: intent.clientSecret,
      },
    };
  }

  async markPaid(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: orderInclude,
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Order is not awaiting payment');
    }

    const settled = await this.payments.verifyIntent(order.paymentIntentId);
    if (!settled) {
      throw new BadRequestException('Payment has not completed yet');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PAID, paidAt: new Date() },
      });

      // Decrement inventory for physical items
      for (const item of order.items) {
        if (item.format !== 'PHYSICAL') continue;
        const inventory = await tx.inventory.findFirst({
          where: { bookId: item.bookId, onHand: { gte: item.quantity } },
          orderBy: { onHand: 'desc' },
        });
        if (inventory) {
          await tx.inventory.update({
            where: { id: inventory.id },
            data: { onHand: { decrement: item.quantity } },
          });
        }
      }

      // Clear the cart now that the purchase is complete
      const cart = await tx.cart.findUnique({ where: { userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    });

    return this.findOne(orderId, { userId });
  }

  async cancel(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: orderInclude,
    });
    if (!order) throw new NotFoundException('Order not found');
    if (
      order.status !== OrderStatus.PENDING_PAYMENT &&
      order.status !== OrderStatus.PAID
    ) {
      throw new BadRequestException(
        'Order can no longer be cancelled — contact support',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      if (order.status === OrderStatus.PAID) {
        await this.restoreInventory(tx, order);
      }
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED, cancelledAt: new Date() },
      });
    });

    return this.findOne(orderId, { userId });
  }

  private async restoreInventory(
    tx: Prisma.TransactionClient,
    order: OrderWithRelations,
  ) {
    for (const item of order.items) {
      if (item.format !== 'PHYSICAL') continue;
      const inventory = await tx.inventory.findFirst({
        where: { bookId: item.bookId },
      });
      if (inventory) {
        await tx.inventory.update({
          where: { id: inventory.id },
          data: { onHand: { increment: item.quantity } },
        });
      }
    }
  }

  async listForUser(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((o) => this.mapOrder(o));
  }

  async findOne(
    orderId: string,
    opts: { userId?: string; admin?: boolean } = {},
  ) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        ...(opts.userId ? { userId: opts.userId } : {}),
      },
      include: orderInclude,
    });
    if (!order) throw new NotFoundException('Order not found');
    return this.mapOrder(order, { admin: opts.admin });
  }

  async adminList(query: {
    status?: OrderStatus;
    q?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 20;
    const where: Prisma.OrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.q) {
      where.OR = [
        { number: { contains: query.q, mode: 'insensitive' } },
        { user: { email: { contains: query.q, mode: 'insensitive' } } },
      ];
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data: rows.map((o) => this.mapOrder(o, { admin: true })),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  async adminUpdateStatus(
    orderId: string,
    input: { status: OrderStatus; trackingNumber?: string | null },
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: orderInclude,
    });
    if (!order) throw new NotFoundException('Order not found');

    const allowed: Partial<Record<OrderStatus, OrderStatus[]>> = {
      PAID: [OrderStatus.PROCESSING, OrderStatus.CANCELLED, OrderStatus.REFUNDED],
      PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED, OrderStatus.REFUNDED],
      SHIPPED: [OrderStatus.DELIVERED, OrderStatus.REFUNDED],
      DELIVERED: [OrderStatus.REFUNDED],
    };
    if (!allowed[order.status]?.includes(input.status)) {
      throw new ForbiddenException(
        `Cannot move order from ${order.status} to ${input.status}`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      if (
        input.status === OrderStatus.CANCELLED ||
        input.status === OrderStatus.REFUNDED
      ) {
        await this.restoreInventory(tx, order);
      }
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: input.status,
          trackingNumber: input.trackingNumber ?? order.trackingNumber,
          shippedAt:
            input.status === OrderStatus.SHIPPED ? new Date() : order.shippedAt,
          deliveredAt:
            input.status === OrderStatus.DELIVERED
              ? new Date()
              : order.deliveredAt,
          cancelledAt:
            input.status === OrderStatus.CANCELLED
              ? new Date()
              : order.cancelledAt,
        },
      });
    });

    return this.findOne(orderId, { admin: true });
  }
}
