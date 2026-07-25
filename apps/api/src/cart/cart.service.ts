import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { coverUrl, decimalToNumber } from '../common/utils';

const cartInclude = {
  items: {
    include: {
      bookFormat: {
        include: {
          book: { include: { authors: { include: { author: true } } } },
        },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
} satisfies Prisma.CartInclude;

type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private mapCart(cart: CartWithItems) {
    const items = cart.items.map((item) => {
      const unitPrice = decimalToNumber(item.bookFormat.price);
      return {
        id: item.id,
        bookFormatId: item.bookFormatId,
        bookId: item.bookFormat.bookId,
        title: item.bookFormat.book.title,
        slug: item.bookFormat.book.slug,
        format: item.bookFormat.format,
        unitPrice,
        quantity: item.quantity,
        lineTotal: Math.round(unitPrice * item.quantity * 100) / 100,
        coverUrl: coverUrl(item.bookFormat.book.coverKey),
        authorName: item.bookFormat.book.authors[0]?.author.name ?? null,
      };
    });
    return {
      id: cart.id,
      items,
      subtotal:
        Math.round(items.reduce((sum, i) => sum + i.lineTotal, 0) * 100) / 100,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      hasPhysicalItems: items.some((i) => i.format === 'PHYSICAL'),
    };
  }

  async getOrCreate(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: cartInclude,
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: cartInclude,
      });
    }
    return this.mapCart(cart);
  }

  async addItem(userId: string, bookFormatId: string, quantity: number) {
    const format = await this.prisma.bookFormat.findUnique({
      where: { id: bookFormatId },
      include: { book: true },
    });
    if (!format || format.book.status !== 'PUBLISHED') {
      throw new NotFoundException('Book format not found');
    }
    if (format.format === 'EBOOK' && quantity > 1) {
      quantity = 1;
    }

    const cart = await this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    await this.prisma.cartItem.upsert({
      where: {
        cartId_bookFormatId: { cartId: cart.id, bookFormatId },
      },
      create: { cartId: cart.id, bookFormatId, quantity },
      update:
        format.format === 'EBOOK'
          ? { quantity: 1 }
          : { quantity: { increment: quantity } },
    });

    return this.getOrCreate(userId);
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId } },
    });
    if (!item) throw new NotFoundException('Cart item not found');

    if (quantity <= 0) {
      await this.prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      await this.prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity },
      });
    }
    return this.getOrCreate(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId } },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    await this.prisma.cartItem.delete({ where: { id: item.id } });
    return this.getOrCreate(userId);
  }

  async clear(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return this.getOrCreate(userId);
  }

  async assertNotEmpty(userId: string) {
    const cart = await this.getOrCreate(userId);
    if (!cart.items.length) {
      throw new BadRequestException('Cart is empty');
    }
    return cart;
  }
}
