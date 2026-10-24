import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { SearchDto } from './catalog.dto';
import { Roles } from 'src/shared/decorator/roles.decorator';
import { Role } from 'src/user/user.dto';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/shared/guard/roles-guard';

/** 웹 콘솔 전용 카탈로그 API. API 키 대신 로그인(JWT)으로 인증하며 API 사용량에는 집계하지 않는다. */
@ApiExcludeController()
@Controller('api/catalog')
export class CatalogWebController {

  constructor(
    private catalogService: CatalogService
  ) { }

  @Roles(Role.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Post('admin/search')
  searchByAdmin(@Body() dto: SearchDto) {
    return this.catalogService.search(dto);
  }

  @UseGuards(JwtGuard)
  @Post('web/search')
  searchByUser(@Body() dto: SearchDto) {
    return this.catalogService.search(dto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Get('admin/itemId/:itemId')
  getItemByAdmin(@Param('itemId') itemId: string) {
    return this.catalogService.getItemById(itemId);
  }
}
