import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APIFeatureUsage, APIKey } from './api.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      APIKey,
      APIFeatureUsage
    ]),
  ],
  providers: [
  ],
  controllers: [
  ],
})
export class APIModule { }
