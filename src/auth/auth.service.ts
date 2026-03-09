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

  async login(email: string, password: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user) throw new UnauthorizedException();

    const match = await this.comparePassword(password, user.password);
    if (!match) throw new UnauthorizedException();

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
      role: user.role,
    }
    return this.jwtService.sign(data);
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

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOneBy({ id })
  }
}
