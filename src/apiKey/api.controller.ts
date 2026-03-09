import { Body, Controller, Delete, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaginationSearchDto } from 'src/shared/interface/pagination.dto';
import { CreateAPIKeyDto, ResponseCreateAPIKey, UpdateAPIKeyDto } from './api.dto';
import { APIService } from './api.service';

@Controller('api/apiKeys')
export class APIKeyController {
  constructor(
    private apiService: APIService
  ) { }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() dto: CreateAPIKeyDto, @Request() request): Promise<ResponseCreateAPIKey> {
    const userId = request.user.id;
    return this.apiService.create(userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('search')
  async search(@Body() body: PaginationSearchDto) {
    return await this.apiService.search(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateAPIKeyDto) {
    return await this.apiService.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.apiService.delete(id);
  }
}