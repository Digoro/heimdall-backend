import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Roles } from 'src/shared/decorator/roles.decorator';
import { RolesGuard } from 'src/shared/guard/roles-guard';
import { Role } from 'src/user/user.dto';
import { OrderSearchDto, OrderUpdateDto } from './order.dto';
import { Order } from './order.entity';
import { OrderService } from './order.service';

@Controller('api/orders')
export class OrderController {

  constructor(
    private orderService: OrderService,
  ) { }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/:id')
  get(@Param('id') id: number): Promise<Order> {
    return this.orderService.get(id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('search')
  search(@Body() dto: OrderSearchDto): Promise<Pagination<Order>> {
    return this.orderService.search(dto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: OrderUpdateDto) {
    return await this.orderService.update(id, dto);
  }
}
