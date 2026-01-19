import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UserController } from './user.controller';

@Module({
  imports: [
    AuthModule
  ],
  providers: [
  ],
  controllers: [
    UserController
  ],
})
export class UserModule { }
