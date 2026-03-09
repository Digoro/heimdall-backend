import { Body, Controller, Get, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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
      throw new UnauthorizedException('Incorrect email or password. Please try again.');
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user')
  async getUser(@Request() request) {
    const userId = request.user.id;
    return await this.authService.findById(userId);
  }
}