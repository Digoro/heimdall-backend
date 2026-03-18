import { Body, Controller, Get, Headers, Param, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Roles } from 'src/shared/decorator/roles.decorator';
import { APIKeyGuard } from 'src/shared/guard/api-key-guard';
import { RolesGuard } from 'src/shared/guard/roles-guard';
import { APIUsageInterceptor } from 'src/shared/interceptor/api-usage.interceptor';
import { APIPaginationResponse } from 'src/shared/interface/api-pagination-response';
import { ErrorResponseDto } from 'src/shared/interface/error-response.dto';
import { Role } from 'src/user/user.dto';
import { ArchvingOrderRequestDto, OrderSearchDto, OrderUpdateDto, TaskingOrderRequestDto } from './order.dto';
import { Order } from './order.entity';
import { OrderService } from './order.service';

@ApiTags('Orders')
@Controller('api/orders')
export class OrderController {

  constructor(
    private orderService: OrderService,
  ) { }

  @ApiExcludeEndpoint()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('admin/:id')
  get(@Param('id') id: number): Promise<Order> {
    return this.orderService.get(id);
  }

  @ApiExcludeEndpoint()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('admin/search')
  searchByAdmin(@Body() dto: OrderSearchDto): Promise<Pagination<Order>> {
    return this.orderService.search(dto);
  }

  @ApiExcludeEndpoint()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put('admin/:id')
  async update(@Param('id') id: number, @Body() dto: OrderUpdateDto) {
    return await this.orderService.update(id, dto);
  }

  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Search Order',
    description: 'Search orders with pagination and filters'
  })
  @ApiBody({
    type: OrderSearchDto
  })
  @APIPaginationResponse(Order)
  @ApiResponse({
    status: 401,
    description: 'Invalid API key',
    type: ErrorResponseDto
  })
  @ApiOperation({
    summary: 'Search Orders'
  })
  @UseGuards(APIKeyGuard)
  @Post('search')
  search(@Headers('api-key') apiKey: string, @Body() dto: OrderSearchDto): Promise<Pagination<Order>> {
    return this.orderService.searchByAPIKey(apiKey, dto);
  }

  @Post('archive')
  @UseGuards(APIKeyGuard)
  @UseInterceptors(APIUsageInterceptor)
  archiveOrder(@Headers('api-key') apiKey: string, @Body() dto: ArchvingOrderRequestDto) {
    return this.orderService.archvingOrder(apiKey, dto);
  }

  @Post('task')
  @UseGuards(APIKeyGuard)
  @UseInterceptors(APIUsageInterceptor)
  taskOrder(@Headers('api-key') apiKey: string, @Body() dto: TaskingOrderRequestDto) {
    return this.orderService.taksingOrder(apiKey, dto);
  }
}
