import { Controller, Get, Param, UseGuards, Res } from '@nestjs/common';
import { APIKeyGuard } from 'src/shared/guard/api-key-guard';
import { OrderService } from './order.service';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Download Product')
@Controller('orders')
export class DownloadController {

  constructor(
    private orderService: OrderService,
    private configService: ConfigService
  ) { }

  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Download Product', description: `Download product by order id.
    
**FileType**
- 'data': SAR Image
- 'metadata': metadata(.json)
- 'thumbnail': thumbnail
` })
  @UseGuards(APIKeyGuard)
  @Get(':orderId/download/:fileType')
  @UseGuards(APIKeyGuard)
  async download(@Param('orderId') orderId: string, @Param('fileType') fileType: string, @Res() res) {
    const order = await this.orderService.get(orderId);
    const relativePath = order.filePath[fileType];
    const absolutePath = path.join(this.configService.getOrThrow('STORAGE_BASE_PATH'), relativePath);
    res.setHeader('Content-Disposition', `attachment; filename="aa.tif"`);
    fs.createReadStream(absolutePath).pipe(res);
  }
}