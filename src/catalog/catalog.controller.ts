import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/shared/decorator/roles.decorator';
import { RolesGuard } from 'src/shared/guard/roles-guard';
import { Role } from 'src/user/user.dto';
import { Catalog } from './catalog.entity';
import { CatalogService } from './catalog.service';

@Controller('api/catalogs')
export class CatalogController {

  constructor(
    private catalogService: CatalogService,
  ) { }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('admin/:id')
  get(@Param('id') id: number): Promise<Catalog> {
    return this.catalogService.get(id);
  }
}
