import { Controller, Get } from '@nestjs/common';

@Controller('api/users')
export class UsersController {
  @Get()
  findAll() {
    return [
      { id: 1, name: 'Alice', role: 'admin' },
      { id: 2, name: 'Bob', role: 'operator' },
      { id: 3, name: 'Charlie', role: 'viewer' },
    ];
  }
}
