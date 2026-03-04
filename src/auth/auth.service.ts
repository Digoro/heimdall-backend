import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCreateDto } from 'src/user/user.dto';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService) { }

  login2(email: string, password: string) {
    if (password != 'ap') {
      throw new UnauthorizedException();
    }
    const accessToken = this.jwtService.sign({ email });
    return accessToken;
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user) throw new UnauthorizedException('로그인에 실패하였습니다. 입력 정보를 다시 확인해주세요.');
    const match = await this.comparePassword(password, user.password);
    if (!match) throw new UnauthorizedException('로그인에 실패하였습니다. 입력 정보를 다시 확인해주세요.');
    return await this.generateJWT(user);
  }

  async comparePassword(newPassword: string, passwordHash: string): Promise<boolean> {
    return await bcrypt.compare(newPassword, passwordHash);
  }

  async generateJWT(user: User): Promise<string> {
    const data = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
    return this.jwtService.sign(data);
  }

  async create(userDto: UserCreateDto): Promise<User> {
    const findEmail = await this.findByEmail(userDto.email);
    if (findEmail) throw new BadRequestException('이미 해당 이메일이 존재합니다.');
    const user = await this.userRepository.save(this.userRepository.create(userDto));
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ email })
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOneBy({ id })
  }
}
