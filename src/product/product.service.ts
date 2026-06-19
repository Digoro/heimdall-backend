import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderService } from 'src/order/order.service';
import * as path from 'path';
import * as fs from 'fs';
import { OrderStatus } from 'src/order/order.dto';

@Injectable()
export class ProductService {
    private basePath: string;

    constructor(
        private configService: ConfigService,
        private orderService: OrderService
    ) {
        this.basePath = this.configService.getOrThrow<string>('STORAGE_BASE_PATH');
    }

    async uploadProductFiles(orderId: string, files: {
        data?: Express.Multer.File[];
        metadata?: Express.Multer.File[];
        thumbnail?: Express.Multer.File[];
    }) {
        if (!files.data && !files.metadata && !files.thumbnail) {
            throw new BadRequestException('There is no upload file');
        }
        const order = await this.orderService.findByIdWithUser(orderId);
        if (!order) {
            throw new BadRequestException('order not founded');
        }

        const destDir = path.join(this.basePath, 'orders', orderId);
        await fs.promises.mkdir(destDir, { recursive: true });

        const fileMap = {
            data: { file: files.data?.[0] },
            metadata: { file: files.metadata?.[0] },
            thumbnail: { file: files.thumbnail?.[0] },
        }

        const savedPaths: Record<string, string> = {};
        const uploaded: string[] = [];
        const errors: string[] = [];

        for (const [type, { file }] of Object.entries(fileMap)) {
            if (!file) continue;

            if (order.filePath?.[type]) {
                await fs.promises.unlink(path.join(this.basePath, order.filePath[type])).catch(() => { });
            }
            const destPath = path.join(destDir, file.originalname);
            const relativePath = path.join('orders', orderId, file.originalname);

            try {
                await fs.promises.rename(file.path, destPath);
                savedPaths[type] = relativePath;
                uploaded.push(type);
            } catch (error) {
                errors.push(type);
                fs.promises.unlink(file.path).catch(() => { });
            }

            if (uploaded.length > 0) {
                await this.orderService.update(orderId, {
                    filePath: {
                        ...(order.filePath ?? {}),
                        ...savedPaths
                    }
                });
            }
        }

        const baseUrl = this.configService.getOrThrow('API_BASE_URL');
        await this.orderService.update(orderId, {
            downloadUrl: {
                data: `${baseUrl}/orders/${orderId}/download/data`,
                metadata: `${baseUrl}/orders/${orderId}/download/metadata`,
                thumbnail: `${baseUrl}/orders/${orderId}/download/thumbnail`,
            }
        });

        await this.orderService.updateStatus(orderId, order.user.id, { status: OrderStatus.DELIVERED });

        return { uploaded, errors, message: errors.length > 0 ? `${uploaded.length} successed, ${errors.length} failed` : `${uploaded.length} successed` }
    }
}