import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from 'nestjs-typeorm-paginate';
import { AuthService } from 'src/auth/auth.service';
import { UserCreateDto, UserSearchDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('api/users')
export class UserController {

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) { }

  @Post('')
  create(@Body() user: UserCreateDto): Promise<User> {
    return this.authService.create(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('search')
  search(@Body() dto: UserSearchDto): Promise<Pagination<User>> {
    return this.userService.search(dto);
  }
}
