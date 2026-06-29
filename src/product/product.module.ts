import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ProductController } from './product.controller';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { MulterModule } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { OrderModule } from 'src/order/order.module';
import { CatalogModule } from 'src/catalog/catalog.module';
import { DownloadController } from './download.controller';
import { APIModule } from 'src/apiKey/api.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product
    ]),
    AuthModule,
    APIModule,
    OrderModule,
    CatalogModule,
    MulterModule.registerAsync({
      useFactory: async () => {
        await fs.promises.mkdir('/tmp/heimdall', { recursive: true });

        return {
          dest: '/tmp/heimdall',
          limits: {
            fileSize: 1024 * 1024 * 1024 * 3 //3GB
          },
          fileFilter: (req, file, cb) => {
            const allowMimeType: Record<string, string[]> = {
              data: ['.tif', '.tiff'],
              metadata: ['.json'],
              thumbnail: ['.png', '.jpg', '.jpeg', '.webp']
            };
            const allowed = allowMimeType[file.fieldname];
            if (!allowed) return cb(null, true);
            const ext = path.extname(file.originalname).toLowerCase();
            if (!allowed.includes(ext)) {
              return cb(new Error(`${file.fieldname} file format error, allowed: ${allowed.join(', ')}`), false);
            }
            cb(null, true);
          }
        }
      }
    })
  ],
  providers: [
    ProductService,
  ],
  controllers: [
    ProductController,
    DownloadController
  ],
  exports: [
    ProductService
  ]
})
export class ProductModule { }
