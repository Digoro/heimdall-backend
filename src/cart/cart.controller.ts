import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';

@ApiTags('Cart')
@Controller('api/cart')
export class CartController {

  constructor(
    private cartService: CartService,
  ) { }

}