import { Controller, Param, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/shared/decorator/roles.decorator';
import { RolesGuard } from 'src/shared/guard/roles-guard';
import { Role } from 'src/user/user.dto';
import { ProductService } from './product.service';
import { JwtGuard } from 'src/auth/jwt.guard';

@Controller('api/products')
export class ProductController {

  constructor(
    private productService: ProductService,
  ) { }

  @Roles(Role.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'data', maxCount: 1 },
      { name: 'metadata', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ])
  )
  @Post('admin/upload/:orderId')
  upload(@Param('orderId') orderId: string, @Req() req: any) {
    const files = req.files as {
      data?: Express.Multer.File[];
      metadata?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    }
    return this.productService.uploadProductFiles(orderId, files);
  }
}
