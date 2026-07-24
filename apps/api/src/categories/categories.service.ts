import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugifyName } from '../common/utils';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async get(id: string) {
    const row = await this.prisma.category.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Category not found');
    return row;
  }

  create(input: {
    name: string;
    slug?: string;
    description?: string | null;
  }) {
    return this.prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug || slugifyName(input.name),
        description: input.description,
      },
    });
  }

  async update(
    id: string,
    input: Partial<{
      name: string;
      slug: string;
      description: string | null;
    }>,
  ) {
    await this.get(id);
    return this.prisma.category.update({ where: { id }, data: input });
  }

  async remove(id: string) {
    await this.get(id);
    await this.prisma.category.delete({ where: { id } });
  }
}
