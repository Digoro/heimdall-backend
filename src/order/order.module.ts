import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { Order } from './order.entity';
import { OrderService } from './order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order
    ]),
  ],
  providers: [
    OrderService
  ],
  controllers: [
    OrderController
  ],
})
export class OrderModule { }
