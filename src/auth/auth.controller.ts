import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService
  ) { }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      const jwt = await this.authService.login(body.email, body.password);
      return { accessToken: jwt }
    } catch {
      throw new UnauthorizedException('로그인에 실패하였습니다. 입력 정보를 다시 확인해주세요.');
    }
  }
}