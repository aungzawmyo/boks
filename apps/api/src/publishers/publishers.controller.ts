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
import { PublishersService } from './publishers.service';
import { JwtAuthGuard, Roles, RolesGuard } from '../common/guards';

@Controller('publishers')
export class PublishersController {
  constructor(private publishers: PublishersService) {}

  @Get()
  list() {
    return this.publishers.list();
  }
}

@Controller('admin/publishers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
export class AdminPublishersController {
  constructor(private publishers: PublishersService) {}

  @Get()
  list() {
    return this.publishers.list();
  }

  @Post()
  create(@Body() body: { name: string; slug?: string }) {
    return this.publishers.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<{ name: string; slug: string }>,
  ) {
    return this.publishers.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.publishers.remove(id);
  }
}
