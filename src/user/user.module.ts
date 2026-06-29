import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserController } from './user.controller';
import { User, WebhookLog } from './user.entity';
import { UserService } from './user.service';
import { WebhookService } from './webhook.service';
import { HttpModule } from '@nestjs/axios';
import { Order } from 'src/order/order.entity';
import { MailService } from './mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Order,
      WebhookLog
    ]),
    AuthModule,
    HttpModule
  ],
  providers: [
    UserService,
    WebhookService,
    MailService
  ],
  controllers: [
    UserController
  ],
  exports: [
    UserService,
    WebhookService,
    MailService
  ]
})
export class UserModule { }
