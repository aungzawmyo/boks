import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { AdminBooksController } from './admin-books.controller';

@Module({
  controllers: [BooksController, AdminBooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
