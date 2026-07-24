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
import { CategoriesService } from './categories.service';
import { JwtAuthGuard, Roles, RolesGuard } from '../common/guards';

@Controller('categories')
export class CategoriesController {
  constructor(private categories: CategoriesService) {}

  @Get()
  list() {
    return this.categories.list();
  }
}

@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
export class AdminCategoriesController {
  constructor(private categories: CategoriesService) {}

  @Get()
  list() {
    return this.categories.list();
  }

  @Post()
  create(
    @Body()
    body: { name: string; slug?: string; description?: string | null },
  ) {
    return this.categories.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: Partial<{ name: string; slug: string; description: string | null }>,
  ) {
    return this.categories.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.categories.remove(id);
  }
}
