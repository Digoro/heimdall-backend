import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCreateDto } from 'src/user/user.dto';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  FIFTEEN_MIN = 15 * 60 * 1000;
  SEVEN_DAY = 7 * 24 * 60 * 60 * 1000;

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) { }

  async login(email: string, password: string): Promise<{ accessToken: string, refreshToken: string, user: User }> {
    const user = await this.findByEmail(email);
    if (!user) throw new UnauthorizedException();

    if (!user.isApproved) throw new UnauthorizedException();

    const match = await this.comparePassword(password, user.password);
    if (!match) throw new UnauthorizedException();

    const { accessToken, refreshToken } = await this.generateJWT(user);
    await this.userRepository.update(user.id, { refreshToken });

    return { accessToken, refreshToken, user };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get("JWT_REFRESH_TOKEN_SECRET")
      });
      const user = await this.findById(payload.id);

      if (user?.refreshToken != refreshToken) {
        throw new UnauthorizedException();
      }

      const { accessToken } = await this.generateJWT(payload)
      return { accessToken };
    } catch {
      throw new UnauthorizedException("Refresh token expired");
    }
  }

  private async comparePassword(newPassword: string, passwordHash: string): Promise<boolean> {
    return await bcrypt.compare(newPassword, passwordHash);
  }

  private async generateJWT(user: User): Promise<{ accessToken: string, refreshToken: string }> {
    const data = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      dailyLimit: user.dailyLimit,
      dailyUsage: user.dailyUsage,
      monthlyLimit: user.monthlyLimit,
      monthlyUsage: user.monthlyUsage
    }
    const accessToken = this.jwtService.sign(data, {
      secret: this.configService.get("JWT_ACCESS_TOKEN_SECRET"),
      expiresIn: this.FIFTEEN_MIN
    });
    const refreshToken = this.jwtService.sign(data, {
      secret: this.configService.get("JWT_REFRESH_TOKEN_SECRET"),
      expiresIn: this.SEVEN_DAY
    });

    return { accessToken, refreshToken };
  }

  async create(userDto: UserCreateDto): Promise<User> {
    const findEmail = await this.findByEmail(userDto.email);
    if (findEmail) throw new BadRequestException('Already exist email.');

    const user = await this.userRepository.save(this.userRepository.create(userDto));
    return (await this.findById(user.id))!
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ email })
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ id })
  }

  async logout(userId: string) {
    return await this.userRepository.update(userId, { refreshToken: '' });
  }
}
