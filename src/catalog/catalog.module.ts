import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CatalogController } from './catalog.controller';
import { CatalogCollection, CatalogItem } from './catalog.entity';
import { CatalogService } from './catalog.service';
import { CollectionSeed } from './catalog.seed';
import { APIModule } from 'src/apiKey/api.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CatalogCollection,
      CatalogItem
    ]),
    AuthModule,
    APIModule
  ],
  providers: [
    CatalogService,
    CollectionSeed,
  ],
  controllers: [
    CatalogController,
  ],
  exports: [
    CatalogService
  ]
})
export class CatalogModule { }
