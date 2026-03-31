import { Controller, Get, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { Roles } from 'src/shared/decorator/roles.decorator';
import { RolesGuard } from 'src/shared/guard/roles-guard';
import { Role } from 'src/user/user.dto';
import { Catalog } from './catalog.entity';
import { CatalogService } from './catalog.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';

@Controller('api/catalogs')
export class CatalogController {

  constructor(
    private catalogService: CatalogService,
  ) { }

  @ApiExcludeEndpoint()
  @Roles(Role.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Get('admin/:id')
  async get(@Param('id') id: number): Promise<Catalog> {
    const catalog = await this.catalogService.get(id);
    if (!catalog) throw new NotFoundException();
    else return catalog;
  }
}
