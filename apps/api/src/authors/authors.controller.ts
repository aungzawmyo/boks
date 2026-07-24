import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthorsService } from './authors.service';
import { JwtAuthGuard, Roles, RolesGuard } from '../common/guards';

@Controller('authors')
export class AuthorsController {
  constructor(private authors: AuthorsService) {}

  @Get()
  list() {
    return this.authors.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.authors.get(id);
  }
}

@Controller('admin/authors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
export class AdminAuthorsController {
  constructor(private authors: AuthorsService) {}

  @Get()
  list() {
    return this.authors.list();
  }

  @Post()
  create(
    @Body() body: { name: string; slug?: string; bio?: string | null },
  ) {
    return this.authors.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<{ name: string; slug: string; bio: string | null }>,
  ) {
    return this.authors.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.authors.remove(id);
  }
}
