import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) { }

  login(email: string, password: string) {
    if (password != 'adminpassword') {
      throw new UnauthorizedException();
    }
    const accessToken = this.jwtService.sign({ email });
    return { accessToken };
  }
}
