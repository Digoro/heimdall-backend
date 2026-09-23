import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { Cart } from './cart.entity';
import { CartService } from './cart.service';
import { CartItem } from './cart-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartItem
    ]),
  ],
  providers: [
    CartService
  ],
  controllers: [
    CartController,
  ]
})
export class CartModule { }
