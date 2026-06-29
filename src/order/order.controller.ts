import { Body, Controller, Get, Headers, Param, Patch, Post, Put, UseGuards, Request, UseInterceptors, ParseUUIDPipe } from '@nestjs/common';
import { ApiBody, ApiExcludeEndpoint, ApiOperation, ApiParam, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Roles } from 'src/shared/decorator/roles.decorator';
import { APIKeyGuard } from 'src/shared/guard/api-key-guard';
import { RolesGuard } from 'src/shared/guard/roles-guard';
import { APIUsageInterceptor } from 'src/shared/interceptor/api-usage.interceptor';
import { APIPaginationResponse as ApiPaginationResponse } from 'src/shared/interface/api-pagination-response';
import { NotFoundErrorResponseDto, UnauthorizedErrorResponseDto } from 'src/shared/interface/error-response.dto';
import { ArchiveOrderRequestDto, OrderSearchDto, OrderStatusUpdateDto, TaskOrderRequestDto } from './order.dto';
import { Order } from './order.entity';
import { OrderService } from './order.service';
import { Serialize, SerializeList } from 'src/shared/decorator/serialize.decorator';
import { JwtGuard } from 'src/auth/jwt.guard';
import * as userDto from 'src/user/user.dto';

@ApiTags('Orders')
@Controller('api/orders')
export class OrderController {

  constructor(
    private orderService: OrderService,
  ) { }

  @ApiExcludeEndpoint()
  @Roles(userDto.Role.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Get('admin/:id')
  get(@Param('id') id: string): Promise<Order> {
    return this.orderService.get(id, { includeUser: true });
  }

  @ApiExcludeEndpoint()
  @Roles(userDto.Role.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Post('admin/search')
  searchByAdmin(@Body() dto: OrderSearchDto): Promise<Pagination<Order>> {
    return this.orderService.search(dto);
  }

  @ApiExcludeEndpoint()
  @Roles(userDto.Role.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Put('admin/:id/status')
  async updateStatus(@Request() request, @Param('id') id: string, @Body() dto: OrderStatusUpdateDto) {
    const userId = request.user.id;
    return await this.orderService.updateStatus(id, userId, dto);
  }

  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Search Order', description: 'Search orders with pagination and filters' })
  @ApiBody({ type: OrderSearchDto })
  @ApiPaginationResponse(Order)
  @ApiResponse({ status: 401, description: 'Invalid API key', type: UnauthorizedErrorResponseDto })
  @UseGuards(APIKeyGuard)
  @UseInterceptors(APIUsageInterceptor)
  @Post('search')
  @SerializeList(Order)
  async search(@Headers('api-key') apiKey: string, @Body() dto: OrderSearchDto): Promise<Pagination<Order>> {
    return await this.orderService.searchByAPIKey(apiKey, dto);
  }

  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Get a order by ID', description: 'Returns a single order by its ID' })
  @ApiParam({ name: 'id', description: 'Order identifier' })
  @ApiResponse({ status: 200, type: Order })
  @ApiResponse({ status: 401, description: 'Invalid API key', type: UnauthorizedErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Not found', type: NotFoundErrorResponseDto })
  @UseGuards(APIKeyGuard)
  @UseInterceptors(APIUsageInterceptor)
  @Get(':id')
  getCollection(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return this.orderService.get(id);
  }

  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Archive Order', description: 'Archive order' })
  @ApiBody({ type: ArchiveOrderRequestDto })
  @ApiResponse({ status: 201, type: Order })
  @ApiResponse({ status: 401, description: 'Invalid API key', type: UnauthorizedErrorResponseDto })
  @Post('archive')
  @UseGuards(APIKeyGuard)
  @UseInterceptors(APIUsageInterceptor)
  @Serialize(Order)
  archiveOrder(@Headers('api-key') apiKey: string, @Body() dto: ArchiveOrderRequestDto) {
    return this.orderService.archiveOrder(apiKey, dto);
  }

  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Task Order', description: 'Task order' })
  @ApiBody({ type: TaskOrderRequestDto })
  @ApiResponse({ status: 201, type: Order })
  @ApiResponse({ status: 401, description: 'Invalid API key', type: UnauthorizedErrorResponseDto })
  @Post('task')
  @UseGuards(APIKeyGuard)
  @UseInterceptors(APIUsageInterceptor)
  @Serialize(Order)
  taskOrder(@Headers('api-key') apiKey: string, @Body() dto: TaskOrderRequestDto) {
    return this.orderService.taskOrder(apiKey, dto);
  }

  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Cancel Order', description: 'Cancel order' })
  @ApiResponse({ status: 200, description: 'Ok', example: { message: 'Order canceled successful.' } })
  @ApiResponse({ status: 401, description: 'Invalid API key', type: UnauthorizedErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Not Found', type: NotFoundErrorResponseDto })
  @Patch(':id/cancel')
  @UseGuards(APIKeyGuard)
  @UseInterceptors(APIUsageInterceptor)
  cancel(@Headers('api-key') apiKey: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.cancel(apiKey, id);
  }

  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Approve Order', description: 'Approve order' })
  @ApiResponse({ status: 200, description: 'Ok', example: { message: 'Order approved successful.' } })
  @ApiResponse({ status: 401, description: 'Invalid API key', type: UnauthorizedErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Not Found', type: NotFoundErrorResponseDto })
  @Patch(':id/approve')
  @UseGuards(APIKeyGuard)
  @UseInterceptors(APIUsageInterceptor)
  approve(@Headers('api-key') apiKey: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.approve(apiKey, id);
  }

  @ApiExcludeEndpoint()
  @Post('webhook-test')
  webhook(@Body() data: any) {
    console.log(data);
  }
}