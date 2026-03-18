import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CatalogController } from './catalog.controller';
import { Catalog } from './catalog.entity';
import { CatalogService } from './catalog.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Catalog
    ]),
    AuthModule
  ],
  providers: [
    CatalogService
  ],
  controllers: [
    CatalogController
  ],
  exports: [
    CatalogService
  ]
})
export class CatalogModule { }
