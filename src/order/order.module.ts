import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { OrderController } from './order.controller';
import { Order } from './order.entity';
import { OrderService } from './order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order
    ]),
    AuthModule
  ],
  providers: [
    OrderService
  ],
  controllers: [
    OrderController
  ],
})
export class OrderModule { }
