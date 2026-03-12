import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ProductController } from './product.controller';
import { Product } from './product.entity';
import { ProductService } from './product.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product
    ]),
    AuthModule
  ],
  providers: [
    ProductService
  ],
  controllers: [
    ProductController
  ],
})
export class ProductModule { }
