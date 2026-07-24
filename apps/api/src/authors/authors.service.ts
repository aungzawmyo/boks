import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugifyName } from '../common/utils';

@Injectable()
export class AuthorsService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.author.findMany({ orderBy: { name: 'asc' } });
  }

  async get(id: string) {
    const author = await this.prisma.author.findUnique({ where: { id } });
    if (!author) throw new NotFoundException('Author not found');
    return author;
  }

  create(input: { name: string; slug?: string; bio?: string | null }) {
    return this.prisma.author.create({
      data: {
        name: input.name,
        slug: input.slug || slugifyName(input.name),
        bio: input.bio,
      },
    });
  }

  async update(
    id: string,
    input: Partial<{ name: string; slug: string; bio: string | null }>,
  ) {
    await this.get(id);
    return this.prisma.author.update({ where: { id }, data: input });
  }

  async remove(id: string) {
    await this.get(id);
    await this.prisma.author.delete({ where: { id } });
  }
}
