import { Controller, Get, Param, UseGuards, Res, NotFoundException, ParseUUIDPipe } from '@nestjs/common';
import { APIKeyGuard } from 'src/shared/guard/api-key-guard';
import { OrderService } from '../order/order.service';
import * as fs from 'fs';
import * as path from 'path';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ProductService } from 'src/product/product.service';

@ApiTags('Download Product')
@Controller('orders')
export class DownloadController {

  constructor(
    private orderService: OrderService,
    private productService: ProductService
  ) { }

  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Download Product', description: `Download product by order id.
    
**FileType**
- 'data': SAR Image
- 'metadata': metadata(.json)
- 'thumbnail': thumbnail
` })
  @Get(':orderId/download/:fileType')
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