import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderStatus, Role } from '@prisma/client';
import { ShippingMethodId } from '@boks/configuration';
import { JwtAuthGuard, Roles, RolesGuard } from '../common/guards';
import { OrdersService } from './orders.service';

type AuthedRequest = { user: { id: string } };

@Controller()
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post('checkout')
  checkout(
    @Req() req: AuthedRequest,
    @Body()
    body: { addressId?: string | null; shippingMethod?: ShippingMethodId | null },
  ) {
    return this.orders.checkout(req.user.id, body);
  }

  @Get('orders')
  list(@Req() req: AuthedRequest) {
    return this.orders.listForUser(req.user.id);
  }

  @Get('orders/:id')
  get(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.orders.findOne(id, { userId: req.user.id });
  }

  @Post('orders/:id/pay')
  pay(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.orders.markPaid(req.user.id, id);
  }

  @Post('orders/:id/cancel')
  cancel(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.orders.cancel(req.user.id, id);
  }
}

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
export class AdminOrdersController {
  constructor(private orders: OrdersService) {}

  @Get()
  list(
    @Query()
    query: { status?: OrderStatus; q?: string; page?: number; pageSize?: number },
  ) {
    return this.orders.adminList(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.orders.findOne(id, { admin: true });
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus; trackingNumber?: string | null },
  ) {
    return this.orders.adminUpdateStatus(id, body);
  }
}
