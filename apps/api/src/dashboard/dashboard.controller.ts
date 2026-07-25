import { Controller, Get, UseGuards } from '@nestjs/common';
import { OrderStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard, Roles, RolesGuard } from '../common/guards';
import { decimalToNumber } from '../common/utils';

const REVENUE_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

function growth(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
export class DashboardController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async stats() {
    const now = Date.now();
    const period = 30 * 24 * 60 * 60 * 1000;
    const currentStart = new Date(now - period);
    const previousStart = new Date(now - 2 * period);

    const [
      currentAgg,
      previousAgg,
      totalAgg,
      ordersCount,
      currentOrders,
      previousOrders,
      ebooksSold,
      currentEbooks,
      previousEbooks,
      lowStock,
      publishedBooks,
    ] = await this.prisma.$transaction([
      this.prisma.order.aggregate({
        where: { status: { in: REVENUE_STATUSES }, createdAt: { gte: currentStart } },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: {
          status: { in: REVENUE_STATUSES },
          createdAt: { gte: previousStart, lt: currentStart },
        },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: { status: { in: REVENUE_STATUSES } },
        _sum: { total: true },
      }),
      this.prisma.order.count({ where: { status: { in: REVENUE_STATUSES } } }),
      this.prisma.order.count({
        where: { status: { in: REVENUE_STATUSES }, createdAt: { gte: currentStart } },
      }),
      this.prisma.order.count({
        where: {
          status: { in: REVENUE_STATUSES },
          createdAt: { gte: previousStart, lt: currentStart },
        },
      }),
      this.prisma.orderItem.aggregate({
        where: { format: 'EBOOK', order: { status: { in: REVENUE_STATUSES } } },
        _sum: { quantity: true },
      }),
      this.prisma.orderItem.aggregate({
        where: {
          format: 'EBOOK',
          order: {
            status: { in: REVENUE_STATUSES },
            createdAt: { gte: currentStart },
          },
        },
        _sum: { quantity: true },
      }),
      this.prisma.orderItem.aggregate({
        where: {
          format: 'EBOOK',
          order: {
            status: { in: REVENUE_STATUSES },
            createdAt: { gte: previousStart, lt: currentStart },
          },
        },
        _sum: { quantity: true },
      }),
      this.prisma.inventory.count({ where: { onHand: { lte: 10 } } }),
      this.prisma.book.count({ where: { status: 'PUBLISHED' } }),
    ]);

    return {
      netRevenue: decimalToNumber(totalAgg._sum.total),
      revenueGrowth: growth(
        decimalToNumber(currentAgg._sum.total),
        decimalToNumber(previousAgg._sum.total),
      ),
      orders: ordersCount,
      ordersGrowth: growth(currentOrders, previousOrders),
      ebooksSold: ebooksSold._sum.quantity ?? 0,
      ebooksGrowth: growth(
        currentEbooks._sum.quantity ?? 0,
        previousEbooks._sum.quantity ?? 0,
      ),
      lowStockCount: lowStock,
      publishedBooks,
    };
  }
}
