import { Controller, Get, Param, UseGuards, Res, NotFoundException, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { APIKeyGuard } from 'src/shared/guard/api-key-guard';
import { OrderService } from '../order/order.service';
import * as fs from 'fs';
import * as path from 'path';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ProductService } from 'src/product/product.service';
import { CatalogService } from 'src/catalog/catalog.service';

@ApiTags('Download Product')
@Controller('api/download')
export class DownloadController {

  constructor(
    private orderService: OrderService,
    private catalogService: CatalogService,
    private productService: ProductService
  ) { }

  @Get('catalog/:catalogId/files/:fileType')
  async getThumbnail(@Param('catalogId') catalogId: string, @Param('fileType') fileType: string, @Res() res) {
    if (fileType != 'thumbnail') throw new BadRequestException('Only thumbnail can download');

    const catalog = await this.catalogService.getItemById(catalogId);
    if (!catalog) throw new NotFoundException('Catalog not exist');

    const product = catalog.product;
    const absolutePath = product.filePath?.[fileType];
    if (!absolutePath) throw new NotFoundException('File not found');

    const stat = await fs.promises.stat(absolutePath).catch(() => null);
    if (!stat) throw new NotFoundException('File not found on storage');

    const filename = path.basename(absolutePath);
    res.setHeader('Content-Type', this.getMimeType(filename));
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`);
    res.setHeader('Content-Length', stat.size);

    fs.createReadStream(absolutePath)
      .pipe(res)
      .on('error', (err) => {
        res.status(500).end();
      });
  }

  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Download Product', description: `Download product by order id.
    
**FileType**
- 'data': SAR Image
- 'metadata': metadata(.json)
- 'thumbnail': thumbnail
` })
  @Get('orders/:orderId/files/:fileType')
  @UseGuards(APIKeyGuard)
  async download(@Param('orderId', ParseUUIDPipe) orderId: string, @Param('fileType') fileType: string, @Res() res) {
    const order = await this.orderService.findByIdWithDelieverdItem(orderId);
    if (!order?.deliveredItem) throw new NotFoundException('Product not delivered yet');

    const product = await this.productService.findByDeliverdItemId(order.deliveredItem.id);
    if (!product) throw new NotFoundException('Product not found');

    const absolutePath = product.filePath?.[fileType];
    if (!absolutePath) throw new NotFoundException('File not found');

    const stat = await fs.promises.stat(absolutePath).catch(() => null);
    if (!stat) throw new NotFoundException('File not found on storage');

    const filename = path.basename(absolutePath);
    res.setHeader('Content-Type', this.getMimeType(filename));
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`);
    res.setHeader('Content-Length', stat.size);

    fs.createReadStream(absolutePath)
      .pipe(res)
      .on('error', (err) => {
        res.status(500).end();
      });
  }

  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const map: Record<string, string> = {
      '.tif': 'image/tiff',
      '.tiff': 'image/tiff',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp'
    };
    return map[ext] ?? 'application/octet-stream';
  }
}