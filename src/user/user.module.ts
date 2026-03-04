import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User
    ]),
    AuthModule
  ],
  providers: [
    UserService
  ],
  controllers: [
    UserController
  ],
  exports: [
    UserService
  ]
})
export class UserModule { }
