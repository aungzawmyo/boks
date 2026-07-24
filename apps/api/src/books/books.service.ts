import { Injectable, NotFoundException } from '@nestjs/common';
import { BookStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { coverUrl, decimalToNumber, slugifyName } from '../common/utils';

const bookInclude = {
  authors: { include: { author: true } },
  categories: { include: { category: true } },
  publisher: true,
  formats: true,
  inventory: { include: { warehouse: true } },
} satisfies Prisma.BookInclude;

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  private mapBook(
    book: Prisma.BookGetPayload<{ include: typeof bookInclude }>,
  ) {
    const formats = book.formats.map((f) => ({
      id: f.id,
      format: f.format,
      price: decimalToNumber(f.price),
      compareAtPrice: f.compareAtPrice
        ? decimalToNumber(f.compareAtPrice)
        : null,
      isbn: f.isbn,
      sku: f.sku,
      previewPages: f.previewPages,
      currency: f.currency,
    }));
    const prices = formats.map((f) => f.price);
    return {
      id: book.id,
      title: book.title,
      slug: book.slug,
      description: book.description,
      language: book.language,
      coverUrl: coverUrl(book.coverKey),
      status: book.status,
      averageRating: book.averageRating,
      reviewCount: book.reviewCount,
      authors: book.authors.map((a) => ({
        id: a.author.id,
        name: a.author.name,
        slug: a.author.slug,
        bio: a.author.bio,
      })),
      categories: book.categories.map((c) => ({
        id: c.category.id,
        name: c.category.name,
        slug: c.category.slug,
        description: c.category.description,
      })),
      publisher: book.publisher
        ? {
            id: book.publisher.id,
            name: book.publisher.name,
            slug: book.publisher.slug,
          }
        : null,
      formats,
      lowestPrice: prices.length ? Math.min(...prices) : null,
      inventory: book.inventory.map((i) => ({
        id: i.id,
        warehouseName: i.warehouse.name,
        onHand: i.onHand,
        lowStockThreshold: i.lowStockThreshold,
      })),
      createdAt: book.createdAt.toISOString(),
      updatedAt: book.updatedAt.toISOString(),
    };
  }

  async findMany(
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
    opts: { includeDrafts?: boolean } = {},
  ) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 20;
    const where: Prisma.BookWhereInput = {};

    if (!opts.includeDrafts) {
      where.status = BookStatus.PUBLISHED;
    }

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
        {
          authors: {
            some: {
              author: { name: { contains: query.q, mode: 'insensitive' } },
            },
          },
        },
      ];
    }
    if (query.category) {
      where.categories = {
        some: {
          OR: [
            { categoryId: query.category },
            { category: { slug: query.category } },
          ],
        },
      };
    }
    if (query.author) {
      where.authors = {
        some: {
          OR: [
            { authorId: query.author },
            { author: { slug: query.author } },
          ],
        },
      };
    }
    if (query.publisher) {
      where.OR = [
        ...(Array.isArray(where.OR) ? where.OR : []),
        { publisherId: query.publisher },
        { publisher: { slug: query.publisher } },
      ];
    }
    if (query.language) where.language = query.language;
    if (query.format) {
      where.formats = { some: { format: query.format } };
    }

    let orderBy: Prisma.BookOrderByWithRelationInput = { createdAt: 'desc' };
    switch (query.sort) {
      case 'title':
        orderBy = { title: 'asc' };
        break;
      case 'rating':
        orderBy = { averageRating: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.book.count({ where }),
      this.prisma.book.findMany({
        where,
        include: bookInclude,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    let data = rows.map((b) => this.mapBook(b));
    if (query.sort === 'price_asc') {
      data = data.sort(
        (a, b) => (a.lowestPrice ?? 0) - (b.lowestPrice ?? 0),
      );
    } else if (query.sort === 'price_desc') {
      data = data.sort(
        (a, b) => (b.lowestPrice ?? 0) - (a.lowestPrice ?? 0),
      );
    }

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  async findOne(idOrSlug: string, opts: { includeDrafts?: boolean } = {}) {
    const book = await this.prisma.book.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        ...(opts.includeDrafts ? {} : { status: BookStatus.PUBLISHED }),
      },
      include: bookInclude,
    });
    if (!book) throw new NotFoundException('Book not found');
    return this.mapBook(book);
  }

  async create(input: {
    title: string;
    slug?: string;
    description: string;
    language?: string;
    coverKey?: string | null;
    status?: BookStatus;
    publisherId?: string | null;
    authorIds: string[];
    categoryIds: string[];
    formats: Array<{
      format: 'PHYSICAL' | 'EBOOK';
      price: number;
      compareAtPrice?: number | null;
      isbn?: string | null;
      sku?: string | null;
      previewPages?: number | null;
      currency?: string;
      fileKey?: string | null;
    }>;
    inventoryOnHand?: number;
  }) {
    const slug = input.slug || slugifyName(input.title);
    const warehouse = await this.prisma.warehouse.findFirst();
    const book = await this.prisma.book.create({
      data: {
        title: input.title,
        slug,
        description: input.description,
        language: input.language ?? 'en',
        coverKey: input.coverKey,
        status: input.status ?? BookStatus.DRAFT,
        publisherId: input.publisherId,
        authors: {
          create: input.authorIds.map((authorId) => ({ authorId })),
        },
        categories: {
          create: input.categoryIds.map((categoryId) => ({ categoryId })),
        },
        formats: {
          create: input.formats.map((f) => ({
            format: f.format,
            price: f.price,
            compareAtPrice: f.compareAtPrice,
            isbn: f.isbn,
            sku: f.sku,
            previewPages: f.previewPages,
            currency: f.currency ?? 'USD',
            fileKey: f.fileKey,
          })),
        },
        ...(warehouse
          ? {
              inventory: {
                create: {
                  warehouseId: warehouse.id,
                  onHand: input.inventoryOnHand ?? 0,
                },
              },
            }
          : {}),
      },
      include: bookInclude,
    });
    return this.mapBook(book);
  }

  async update(
    id: string,
    input: Partial<{
      title: string;
      slug: string;
      description: string;
      language: string;
      coverKey: string | null;
      status: BookStatus;
      publisherId: string | null;
      authorIds: string[];
      categoryIds: string[];
      formats: Array<{
        format: 'PHYSICAL' | 'EBOOK';
        price: number;
        compareAtPrice?: number | null;
        isbn?: string | null;
        sku?: string | null;
        previewPages?: number | null;
        currency?: string;
        fileKey?: string | null;
      }>;
      inventoryOnHand: number;
    }>,
  ) {
    const existing = await this.prisma.book.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Book not found');

    await this.prisma.$transaction(async (tx) => {
      if (input.authorIds) {
        await tx.bookAuthor.deleteMany({ where: { bookId: id } });
        await tx.bookAuthor.createMany({
          data: input.authorIds.map((authorId) => ({ bookId: id, authorId })),
        });
      }
      if (input.categoryIds) {
        await tx.bookCategory.deleteMany({ where: { bookId: id } });
        await tx.bookCategory.createMany({
          data: input.categoryIds.map((categoryId) => ({
            bookId: id,
            categoryId,
          })),
        });
      }
      if (input.formats) {
        await tx.bookFormat.deleteMany({ where: { bookId: id } });
        await tx.bookFormat.createMany({
          data: input.formats.map((f) => ({
            bookId: id,
            format: f.format,
            price: f.price,
            compareAtPrice: f.compareAtPrice ?? null,
            isbn: f.isbn ?? null,
            sku: f.sku ?? null,
            previewPages: f.previewPages ?? null,
            currency: f.currency ?? 'USD',
            fileKey: f.fileKey ?? null,
          })),
        });
      }
      if (input.inventoryOnHand !== undefined) {
        const inv = await tx.inventory.findFirst({ where: { bookId: id } });
        if (inv) {
          await tx.inventory.update({
            where: { id: inv.id },
            data: { onHand: input.inventoryOnHand },
          });
        }
      }
      await tx.book.update({
        where: { id },
        data: {
          title: input.title,
          slug: input.slug,
          description: input.description,
          language: input.language,
          coverKey: input.coverKey,
          status: input.status,
          publisherId: input.publisherId,
        },
      });
    });

    return this.findOne(id, { includeDrafts: true });
  }

  async remove(id: string) {
    await this.prisma.book.delete({ where: { id } });
  }
}
