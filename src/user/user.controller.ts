import { Body, Controller, Delete, Param, Post, Put, UseGuards, Request, Get } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { AuthService } from 'src/auth/auth.service';
import { Roles } from 'src/shared/decorator/roles.decorator';
import { RolesGuard } from 'src/shared/guard/roles-guard';
import { Role, UpdateWebhookDto, UserCreateDto, UserSearchDto, UserUpdateDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/jwt.guard';

@Controller('api/users')
export class UserController {

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) { }

  @Roles(Role.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Post('admin')
  async create(@Body() user: UserCreateDto) {
    return await this.authService.create(user);
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Post('admin/search')
  search(@Body() dto: UserSearchDto): Promise<Pagination<User>> {
    return this.userService.search(dto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Delete('admin/:id')
  async delete(@Param('id') id: string) {
    return await this.userService.delete(id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Put('admin/:id')
  async update(@Param('id') id: string, @Body() dto: UserUpdateDto) {
    return await this.userService.update(id, dto);
  }

  @UseGuards(JwtGuard)
  @Post('webhook')
  async registry(@Body() dto: UpdateWebhookDto, @Request() request) {
    const userId = request.user.id;
    return await this.userService.registerWebhook(userId, dto);
  }

  @UseGuards(JwtGuard)
  @Get('webhook')
  async getWebhook(@Request() request) {
    const userId = request.user.id;
    return await this.userService.getWebhook(userId);
  }

  @UseGuards(JwtGuard)
  @Delete('webhook')
  async deleteWebhook(@Request() request) {
    const userId = request.user.id;
    return await this.userService.deleteWebhook(userId);
  }
}
