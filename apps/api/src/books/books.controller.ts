import { Controller, Get, Param, Query } from '@nestjs/common';
import { BooksService } from './books.service';

@Controller('books')
export class BooksController {
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
    return this.books.findMany(query);
  }

  @Get(':idOrSlug')
  get(@Param('idOrSlug') idOrSlug: string) {
    return this.books.findOne(idOrSlug);
  }
}
