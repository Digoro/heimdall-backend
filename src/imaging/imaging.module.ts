import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Imaging } from './imaging.entity';
import { ImagingService } from './imaging.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Imaging
    ]),
  ],
  providers: [
    ImagingService
  ],
  controllers: [
  ],
  exports: [
    ImagingService
  ]
})
export class ImagingModule { }
