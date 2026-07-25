import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { AuthorsModule } from './authors/authors.module';
import { CategoriesModule } from './categories/categories.module';
import { PublishersModule } from './publishers/publishers.module';
import { StorageModule } from './storage/storage.module';
import { HealthController } from './health.controller';
import { DashboardModule } from './dashboard/dashboard.module';
import { CartModule } from './cart/cart.module';
import { AddressesModule } from './addresses/addresses.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '../../../.env'),
        join(__dirname, '../../.env'),
        '.env',
      ],
    }),
    PrismaModule,
    AuthModule,
    BooksModule,
    AuthorsModule,
    CategoriesModule,
    PublishersModule,
    StorageModule,
    DashboardModule,
    CartModule,
    AddressesModule,
    OrdersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
