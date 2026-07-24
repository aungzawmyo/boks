import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { BooksService } from './books.service';
import { JwtAuthGuard, Roles, RolesGuard } from '../common/guards';

@Controller('admin/books')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
export class AdminBooksController {
  constructor(private books: BooksService) {}

  @Get()
  list(
    @Query()
    query: {
      q?: string;
      category?: string;
      author?: string;
      publisher?: string;
      language?: string;
      format?: 'PHYSICAL' | 'EBOOK';
      sort?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    return this.books.findMany(query, { includeDrafts: true });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.books.findOne(id, { includeDrafts: true });
  }

  @Post()
  create(@Body() body: Parameters<BooksService['create']>[0]) {
    return this.books.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Parameters<BooksService['update']>[1],
  ) {
    return this.books.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.books.remove(id);
  }
}
