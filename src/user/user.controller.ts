import { Body, Controller, Delete, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from 'nestjs-typeorm-paginate';
import { AuthService } from 'src/auth/auth.service';
import { Roles } from 'src/shared/decorator/roles.decorator';
import { RolesGuard } from 'src/shared/guard/roles-guard';
import { Role, UserCreateDto, UserSearchDto, UserUpdateDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('api/users')
export class UserController {

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) { }

  @Post('admin')
  async create(@Body() user: UserCreateDto) {
    return await this.authService.create(user);
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('admin/search')
  search(@Body() dto: UserSearchDto): Promise<Pagination<User>> {
    return this.userService.search(dto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete('admin/:id')
  async delete(@Param('id') id: number) {
    return await this.userService.delete(id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put('admin/:id')
  async update(@Param('id') id: number, @Body() dto: UserUpdateDto) {
    return await this.userService.update(id, dto);
  }
}
