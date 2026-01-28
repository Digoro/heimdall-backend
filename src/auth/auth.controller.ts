import { Body, Controller, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import express from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService) { }

  @Post('login')
  login(@Body() body: { email: string; password: string }, @Res() res: express.Response) {
    const accessToken = this.authService.login(body.email, body.password);

    const key = this.configService.get('OMS_ACCESS_TOKEN');
    res.cookie(key, accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 120 * 60 * 1000,
    });

    return res.send({ message: '로그인 성공' });
  }
}