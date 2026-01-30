import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Imaging } from './imaging.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Imaging
    ]),
  ],
  providers: [
  ],
  controllers: [
  ],
})
export class ImagingModule { }
