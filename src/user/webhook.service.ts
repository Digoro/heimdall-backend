import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { HttpService } from '@nestjs/axios';
import { User, WebhookLog } from 'src/user/user.entity';
import { firstValueFrom } from 'rxjs';
import { Order } from 'src/order/order.entity';

@Injectable()
export class WebhookService {

    constructor(
        private httpService: HttpService,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Order) private orderRepository: Repository<Order>,
        @InjectRepository(WebhookLog) private webhookLogRepository: Repository<WebhookLog>
    ) { }

    async notify(orderId: string, userId: string) {
        const order = (await this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.referencedItem', 'referencedItem')
            .leftJoinAndSelect('order.deliveredItem', 'deliveredItem')
            .leftJoinAndSelect('deliveredItem.product', 'product')
            .leftJoinAndSelect('order.imaging', 'imaging')
            .leftJoinAndSelect('order.statusHistory', 'statusHistory')
            .where('order.id = :id', { id: orderId })
            .getOne())!;

        const user = (await this.userRepository.createQueryBuilder('user')
            .where('user.id = :id', { id: userId })
            .getOne())!;

        if (!user?.webhookUrl) return;

        // TODO: 웹훅으로 전달할 정보 정제 필요
        const newOrder = JSON.parse(JSON.stringify(order));
        delete newOrder.deliveredItem.product.filePath;
        await this.send(user, newOrder);
    }

    private async send(user: User, order: Order, attemp = 1) {
        const body = JSON.stringify(order);
        const headers = {
            'Content-Type': 'application/json',
            'X-Webhook-Timestamp': new Date().toISOString(),
        }

        if (user.webhookSecret) {
            const signature = this.sign(user.webhookSecret, body);
            headers['X-Webhook-Signature'] = `sha256=${signature}`;
        }

        let responseCode = 0;
        let success = false;

        try {
            const response = await firstValueFrom(this.httpService.post(user.webhookUrl, order, { headers, timeout: 5000 }));
            responseCode = response.status;
            success = true;
        } catch (error) {
            responseCode = error.response?.status;

            if (attemp < 3) {
                const delay = Math.pow(2, attemp) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.send(user, order, attemp + 1);
            }
        } finally {
            await this.webhookLogRepository.save({
                orderId: order.id,
                status: order.status,
                payload: order,
                responseCode,
                success,
                attemp
            })
        }
    }

    private sign(secret: string, body: string) {
        return crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');
    }
}