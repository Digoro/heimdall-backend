import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Order } from 'src/order/order.entity';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MailService {
    private API_ENDPOINT = 'https://mail.apigw.ntruss.com/api/v1/mails';
    private API_URL = '/mails';

    constructor(
        private httpService: HttpService,
        private configService: ConfigService
    ) { }

    private makeSignature(timestamp: string): string {
        const space = '';
        const newLine = '\n';
        const method = 'POST';
        const url = `${this.API_URL}`;
        const message = [
            method,
            space,
            url,
            timestamp,
            newLine,
            this.configService.get('NCP_ACCESS_KEY')
        ].join(',');

        return crypto
            .createHmac('sha256', this.configService.get('NCP_SECRET_KEY')!)
            .update(message)
            .digest('base64');
    }

    async sendOrderNotification(order: Order): Promise<any> {
        const tiemstamp = Date.now().toString();
        const signature = this.makeSignature(tiemstamp);
        const headers = {
            'Content-Type': 'application/json',
            'x-ncp-apigw-timestamp': tiemstamp,
            'x-ncp-iam-access-key': this.configService.get('NCP_ACCESS_KEY'),
            'x-ncp-apigw-signature-v2': signature
        };
        const body = {
            senderAddress: this.configService.get('MAIL_SENDER'),
            senderName: 'Heimdall',
            title: `[Heimdall] New Order Received - Order ID: ${order.id}`,
            body: `
<h2>A new order has been received</h2>
<table border="1" cellpadding="8" cellspacing="0">
    <tr>
            <td><strong>Order ID</strong></td>
            <td>${order.id}</td>
    </tr>
    <tr>
            <td><strong>Order Type</strong></td>
            <td>${order.type}</td>
    </tr>
    <tr>
            <td><strong>Requested By</strong></td>
            <td>${order.user.name}</td>
    </tr>
    <tr>
            <td><strong>Order Status</strong></td>
            <td>${order.status}</td>
    </tr>
    <tr>
            <td><strong>Received At</strong></td>
            <td>${order.createdAt.toUTCString()}</td>
    </tr>
</table>
<p>Please log in to the Heimdall to review and process this order</p>
<p>This is an automated message. Please do not reply to this email.</p>
            `,
            recipients: [
                {
                    address: this.configService.get('ADMIN_EMAIL'),
                    name: 'Administrator',
                    type: 'R'
                }
            ],
            individual: false,
            advertising: false
        };

        try {
            const response = await firstValueFrom(this.httpService.post(`${this.API_ENDPOINT}${this.API_URL}`, body, { headers }));
            return response;
        } catch (error) {
            throw error;
        }
    }
}