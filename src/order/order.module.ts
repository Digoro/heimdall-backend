import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APIModule } from 'src/apiKey/api.module';
import { AuthModule } from 'src/auth/auth.module';
import { OrderController } from './order.controller';
import { Order, OrderStatusHistory } from './order.entity';
import { OrderService } from './order.service';
import { CatalogModule } from 'src/catalog/catalog.module';
import { ImagingModule } from 'src/imaging/imaging.module';
import { UserModule } from 'src/user/user.module';
import { DownloadController } from './download.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderStatusHistory
    ]),
    AuthModule,
    APIModule,
    CatalogModule,
    ImagingModule,
    UserModule
  ],
  providers: [
    OrderService
  ],
  controllers: [
    OrderController,
    DownloadController
  ],
  exports: [
    OrderService
  ]
})
export class OrderModule { }
