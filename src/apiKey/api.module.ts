import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { APIKeyController } from './api.controller';
import { APIFeatureUsage, APIKey } from './api.entity';
import { APIService } from './api.service';
import { ResetUsageScheduler } from './reset-usage.scheduler';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      APIKey,
      APIFeatureUsage
    ]),
    AuthModule,
    UserModule
  ],
  providers: [
    APIService,
  ],
  controllers: [
    APIKeyController,
    ResetUsageScheduler
  ],
  exports: [
    APIService
  ]
})
export class APIModule { }
