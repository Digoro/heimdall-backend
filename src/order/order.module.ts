import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APIModule } from 'src/apiKey/api.module';
import { AuthModule } from 'src/auth/auth.module';
import { OrderController } from './order.controller';
import { Order } from './order.entity';
import { OrderService } from './order.service';
import { CatalogModule } from 'src/catalog/catalog.module';
import { ImagingModule } from 'src/imaging/imaging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order
    ]),
    AuthModule,
    APIModule,
    CatalogModule,
    ImagingModule
  ],
  providers: [
    OrderService
  ],
  controllers: [
    OrderController
  ],
})
export class OrderModule { }
