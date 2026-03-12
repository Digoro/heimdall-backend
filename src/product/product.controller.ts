import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Roles } from 'src/shared/decorator/roles.decorator';
import { RolesGuard } from 'src/shared/guard/roles-guard';
import { Role } from 'src/user/user.dto';
import { ProductService } from './product.service';

@Controller('api/products')
export class ProductController {

  constructor(
    private productService: ProductService,
  ) { }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
      }
    })
  }))
  @Post('upload')
  upload(@UploadedFile() file: any) {
    return { url: `http://localhost:3000/uploads/${file.filename}` };
  }
}
