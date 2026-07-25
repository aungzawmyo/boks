import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards';
import { AddressesService, AddressInput } from './addresses.service';

type AuthedRequest = { user: { id: string } };

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private addresses: AddressesService) {}

  @Get()
  list(@Req() req: AuthedRequest) {
    return this.addresses.list(req.user.id);
  }

  @Post()
  create(@Req() req: AuthedRequest, @Body() body: AddressInput) {
    return this.addresses.create(req.user.id, body);
  }

  @Patch(':id')
  update(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() body: Partial<AddressInput>,
  ) {
    return this.addresses.update(req.user.id, id, body);
  }

  @Delete(':id')
  remove(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.addresses.remove(req.user.id, id);
  }
}
