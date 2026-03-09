import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { APIKeyController } from './api.controller';
import { APIFeatureUsage, APIKey } from './api.entity';
import { APIService } from './api.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      APIKey,
      APIFeatureUsage
    ]),
    AuthModule
  ],
  providers: [
    APIService,
  ],
  controllers: [
    APIKeyController
  ],
})
export class APIModule { }
