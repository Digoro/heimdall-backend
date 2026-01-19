import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/users')
export class UserController {

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return [
      { id: 1, name: 'Alice', role: 'admin' },
      { id: 2, name: 'Bob', role: 'operator' },
      { id: 3, name: 'Charlie', role: 'viewer' },
    ];
  }
}
