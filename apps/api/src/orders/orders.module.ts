import { Module } from '@nestjs/common';
import { CartModule } from '../cart/cart.module';
import { AdminOrdersController, OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PaymentsService } from './payments.service';

@Module({
  imports: [CartModule],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService, PaymentsService],
})
export class OrdersModule {}
