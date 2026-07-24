import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard, Roles, RolesGuard } from '../common/guards';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
export class DashboardController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async stats() {
    const lowStockCount = await this.prisma.inventory.count({
      where: {
        onHand: { lte: 10 },
      },
    });
    const publishedBooks = await this.prisma.book.count({
      where: { status: 'PUBLISHED' },
    });

    // Phase 1: seed-style KPI placeholders until commerce exists
    return {
      netRevenue: 124560.8,
      revenueGrowth: 18.6,
      orders: 1248,
      ordersGrowth: 14.3,
      ebooksSold: 832,
      ebooksGrowth: 22.7,
      lowStockCount: lowStockCount || 23,
      publishedBooks,
    };
  }
}
