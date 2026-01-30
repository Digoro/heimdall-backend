import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AOI } from './aoi.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AOI
    ]),
  ],
  providers: [
  ],
  controllers: [
  ],
})
export class AOIModule { }
