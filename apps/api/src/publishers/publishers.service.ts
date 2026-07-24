import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugifyName } from '../common/utils';

@Injectable()
export class PublishersService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.publisher.findMany({ orderBy: { name: 'asc' } });
  }

  async get(id: string) {
    const row = await this.prisma.publisher.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Publisher not found');
    return row;
  }

  create(input: { name: string; slug?: string }) {
    return this.prisma.publisher.create({
      data: {
        name: input.name,
        slug: input.slug || slugifyName(input.name),
      },
    });
  }

  async update(
    id: string,
    input: Partial<{ name: string; slug: string }>,
  ) {
    await this.get(id);
    return this.prisma.publisher.update({ where: { id }, data: input });
  }

  async remove(id: string) {
    await this.get(id);
    await this.prisma.publisher.delete({ where: { id } });
  }
}
