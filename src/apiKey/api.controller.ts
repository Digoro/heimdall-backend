import { Body, Controller, Delete, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { PaginationSearchDto } from 'src/shared/interface/pagination.dto';
import { CreateAPIKeyDto, ResponseCreateAPIKey, UpdateApiKeyStatusDto } from './api.dto';
import { APIService } from './api.service';
import { JwtGuard } from 'src/auth/jwt.guard';

@Controller('api/apiKeys')
export class APIKeyController {
  constructor(
    private apiService: APIService
  ) { }

  @UseGuards(JwtGuard)
  @Post()
  create(@Body() dto: CreateAPIKeyDto, @Request() request): Promise<ResponseCreateAPIKey> {
    const userId = request.user.id;
    return this.apiService.create(userId, dto);
  }

  @UseGuards(JwtGuard)
  @Post('/search')
  async search(@Body() body: PaginationSearchDto, @Request() request) {
    const userId = request.user.id;
    return await this.apiService.searchByUser(userId, body);
  }

  @UseGuards(JwtGuard)
  @Put('/status/:id')
  async update(@Param('id') id: number, @Body() dto: UpdateApiKeyStatusDto) {
    return await this.apiService.update(id, dto);
  }

  @UseGuards(JwtGuard)
  @Delete('/:id')
  async delete(@Param('id') id: number) {
    return await this.apiService.delete(id);
  }
}