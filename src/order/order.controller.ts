import { Body, Controller, Get, Headers, Param, Post, Put, SerializeOptions, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Roles } from 'src/shared/decorator/roles.decorator';
import { APIKeyGuard } from 'src/shared/guard/api-key-guard';
import { RolesGuard } from 'src/shared/guard/roles-guard';
import { APIUsageInterceptor } from 'src/shared/interceptor/api-usage.interceptor';
import { APIPaginationResponse as ApiPaginationResponse } from 'src/shared/interface/api-pagination-response';
import { ErrorResponseDto } from 'src/shared/interface/error-response.dto';
import { Role } from 'src/user/user.dto';
import { ArchvingOrderRequestDto, OrderSearchDto, OrderUpdateDto, TaskingOrderRequestDto } from './order.dto';
import { Order } from './order.entity';
import { OrderService } from './order.service';
import { plainToInstance } from 'class-transformer';
import { responseByExpose } from 'src/shared/util/response-by-expose';
import { Serialize, SerializeList } from 'src/shared/decorator/serialize.decorator';

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
  @ApiOperation({ summary: 'Search Order', description: 'Search orders with pagination and filters' })
  @ApiBody({ type: OrderSearchDto })
  @ApiPaginationResponse(Order)
  @ApiResponse({ status: 401, description: 'Invalid API key', type: ErrorResponseDto })
  @UseGuards(APIKeyGuard)
  @Post('search')
  @SerializeList(Order)
  async search(@Headers('api-key') apiKey: string, @Body() dto: OrderSearchDto): Promise<Pagination<Order>> {
    return await this.orderService.searchByAPIKey(apiKey, dto);
  }

  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Archive Order', description: 'Archive order' })
  @ApiBody({ type: ArchvingOrderRequestDto })
  @ApiResponse({ status: 201, type: Order })
  @ApiResponse({ status: 401, description: 'Invalid API key', type: ErrorResponseDto })
  @Post('archive')
  @UseGuards(APIKeyGuard)
  @UseInterceptors(APIUsageInterceptor)
  @Serialize(Order)
  archiveOrder(@Headers('api-key') apiKey: string, @Body() dto: ArchvingOrderRequestDto) {
    return this.orderService.archvingOrder(apiKey, dto);
  }

  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Task Order', description: 'Task order' })
  @ApiBody({ type: TaskingOrderRequestDto })
  @ApiResponse({ status: 201, type: Order })
  @ApiResponse({ status: 401, description: 'Invalid API key', type: ErrorResponseDto })
  @Post('task')
  @UseGuards(APIKeyGuard)
  @UseInterceptors(APIUsageInterceptor)
  @Serialize(Order)
  taskOrder(@Headers('api-key') apiKey: string, @Body() dto: TaskingOrderRequestDto) {
    return this.orderService.taksingOrder(apiKey, dto);
  }
}
