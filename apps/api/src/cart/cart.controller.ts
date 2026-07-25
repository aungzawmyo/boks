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
import { CartService } from './cart.service';

type AuthedRequest = { user: { id: string } };

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cart: CartService) {}

  @Get()
  get(@Req() req: AuthedRequest) {
    return this.cart.getOrCreate(req.user.id);
  }

  @Post('items')
  add(
    @Req() req: AuthedRequest,
    @Body() body: { bookFormatId: string; quantity?: number },
  ) {
    return this.cart.addItem(
      req.user.id,
      body.bookFormatId,
      Number(body.quantity) || 1,
    );
  }

  @Patch('items/:itemId')
  update(
    @Req() req: AuthedRequest,
    @Param('itemId') itemId: string,
    @Body() body: { quantity: number },
  ) {
    return this.cart.updateItem(req.user.id, itemId, Number(body.quantity));
  }

  @Delete('items/:itemId')
  remove(@Req() req: AuthedRequest, @Param('itemId') itemId: string) {
    return this.cart.removeItem(req.user.id, itemId);
  }

  @Delete()
  clear(@Req() req: AuthedRequest) {
    return this.cart.clear(req.user.id);
  }
}
