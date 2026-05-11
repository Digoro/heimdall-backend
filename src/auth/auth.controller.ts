import { Body, Controller, Get, Post, Req, Request, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) { }

  @Post('login')
  async login(@Body() body: { email: string; password: string }, @Res({ passthrough: true }) res) {
    try {
      const { accessToken, refreshToken, user } = await this.authService.login(body.email, body.password);
      this.setCookie(res, 'access_token', accessToken, this.authService.FIFTEEN_MIN);
      this.setCookie(res, 'refresh_token', refreshToken, this.authService.SEVEN_DAY);

      return { message: 'Login successful', user };
    } catch {
      throw new UnauthorizedException('Incorrect email or password. Please try again.');
    }
  }

  @Post('refresh')
  async refresh(@Request() req, @Res({ passthrough: true }) res) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException();

    const { accessToken } = await this.authService.refresh(refreshToken);
    this.setCookie(res, 'access_token', accessToken, this.authService.FIFTEEN_MIN);

    return { message: 'Token refreshed' };
  }

  private setCookie(res: any, key: string, token: string, maxAge: number) {
    res.cookie(key, token, {
      httpOnly: true,
      secure: this.configService.get("ENVIRONMENT") == "PRODUCTION",
      sameSite: 'lax',
      maxAge
    });
  }

  @Post('logout')
  async logout(@Request() req, @Res({ passthrough: true }) res) {
    const refreshToken = req.cookies['refresh_token'];

    if (refreshToken) {
      const payload = this.authService['jwtService'].decode(refreshToken);
      await this.authService.logout(payload?.id);
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'Logout successful' };
  }

  @UseGuards(JwtGuard)
  @Get('me')
  async getUser(@Req() req) {
    return req['user'];
  }
}