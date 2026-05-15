import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { HttpService } from '@nestjs/axios';
import { User, WebhookLog } from 'src/user/user.entity';
import { firstValueFrom } from 'rxjs';
import { Order } from 'src/order/order.entity';
import { OrderStatus } from 'src/order/order.dto';
import { WebhookPayload, WebhookExtra } from './user.dto';

@Injectable()
export class WebhookService {

    constructor(
        private httpService: HttpService,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Order) private orderRepository: Repository<Order>,
        @InjectRepository(WebhookLog) private webhookLogRepository: Repository<WebhookLog>
    ) { }

    async notify(orderId: string, userId: string, status: OrderStatus, extra: WebhookExtra) {
        const order = (await this.orderRepository.createQueryBuilder('order')
            .where('order.id = :id', { id: orderId })
            .getOne())!;

        const user = (await this.userRepository.createQueryBuilder('user')
            .where('user.id = :id', { id: userId })
            .getOne())!;

        if (!user?.webhookUrl) return;

        const payload: WebhookPayload = {
            order,
            status,
            ...extra
        };

        await this.send(user, payload);
    }

    private async send(user: User, payload: WebhookPayload, attemp = 1) {
        const body = JSON.stringify(payload);
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
            const response = await firstValueFrom(this.httpService.post(user.webhookUrl, payload, { headers, timeout: 5000 }));
            responseCode = response.status;
            success = true;
        } catch (error) {
            responseCode = error.response?.status;

            if (attemp < 3) {
                const delay = Math.pow(2, attemp) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.send(user, payload, attemp + 1);
            }
        } finally {
            await this.webhookLogRepository.save({
                orderId: payload.order.id,
                status: payload.status,
                payload,
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