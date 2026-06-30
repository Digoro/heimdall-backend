import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { IncomingMessage } from 'http';
import { Pagination, paginate } from 'nestjs-typeorm-paginate';
import { AuthService } from 'src/auth/auth.service';
import { OrderType } from 'src/order/order.dto';
import { PaginationSearchDto } from 'src/shared/interface/pagination.dto';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { APIKeyStauts, CreateAPIKeyDto, RequestAPI as PaidFeature, ResponseCreateAPIKey, UpdateApiKeyStatusDto } from './api.dto';
import { APIFeatureUsage, APIKey } from './api.entity';

@Injectable()
export class APIService {
    constructor(
        @InjectRepository(APIKey) private apiKeyRepository: Repository<APIKey>,
        @InjectRepository(APIFeatureUsage) private usageRepository: Repository<APIFeatureUsage>,
        private authService: AuthService,
        private userService: UserService
    ) { }

    async searchByUser(userId: string, dto: PaginationSearchDto): Promise<Pagination<APIKey>> {
        const options = { page: dto.page, limit: dto.limit };
        const query = this.apiKeyRepository.createQueryBuilder('apiKey')
            .leftJoin('apiKey.user', 'user')
            .where('user.id = :userId', { userId })
            .andWhere('apiKey.isDeleted = false')
            .orderBy('apiKey.createdAt', 'DESC')

        const results = await paginate<APIKey>(query, options);
        return results;
    }

    generateAPIKey(): string {
        const random = randomBytes(32).toString('hex');
        return `sar_live_${random}`;
    }

    hashAPIKey(apiKey: string): string {
        return createHash('sha256').update(apiKey).digest('hex');
    }

    maskAPIKey(key: string): string {
        const visibleLength = 14;
        const visible = key.substring(0, visibleLength);
        const masked = '*'.repeat(key.length - visibleLength);
        return visible + masked;
    }

    async create(userId: string, dto: CreateAPIKeyDto): Promise<ResponseCreateAPIKey> {
        const user = (await this.authService.findById(userId))!;
        const key = this.generateAPIKey();
        const hashKey = this.hashAPIKey(key);
        const maskKey = this.maskAPIKey(key);
        const newAPIKey = dto.toEntity(user, hashKey, maskKey);
        await this.apiKeyRepository.save(this.apiKeyRepository.create(newAPIKey));
        return { key, maskKey };
    }

    async update(id: string, dto: UpdateApiKeyStatusDto): Promise<{ status: string }> {
        await this.apiKeyRepository.update(id, dto);
        const apiKey = await this.findById(id);
        return { status: apiKey.status };
    }

    async findById(id: string): Promise<APIKey> {
        const apiKey = (await this.apiKeyRepository.findOneBy({ id }))!;
        return apiKey;
    }

    async findByKey(key: string): Promise<APIKey | null> {
        const hashKey = this.hashAPIKey(key);
        const query = this.apiKeyRepository.createQueryBuilder('apiKey')
            .leftJoinAndSelect('apiKey.user', 'user')
            .where('apiKey.hashKey = :hashKey', { hashKey });
        return await query.getOne();
    }

    async useKey(request: IncomingMessage, apiKey: APIKey) {
        if (apiKey.status == APIKeyStauts.INACTIVE) {
            throw new ForbiddenException('Invalid API key');
        }

        await this.update(apiKey.id, { lastUsedAt: new Date() });

        const paidFeatures: PaidFeature[] = [
            { feature: OrderType.ARCHIVE, url: '/api/orders/archive', method: 'POST', point: 1 },
            { feature: OrderType.TASK, url: '/api/orders/task', method: 'POST', point: 1 },
        ];

        const paidFeature = paidFeatures.find(f => f.url == request.url && f.method == request.method);
        if (paidFeature) {
            const user = (await this.authService.findById(apiKey.user.id))!;
            user.dailyUsage += paidFeature.point;
            user.monthlyUsage += paidFeature.point;

            if (user.dailyUsage > user.dailyLimit) {
                throw new ForbiddenException('Daily limit exceeded');
            }
            if (user.monthlyUsage > user.monthlyLimit) {
                throw new ForbiddenException('Monthly limit exceeded');
            }

            await this.addUsage(apiKey, paidFeature.feature, paidFeature.point);

            await this.userService.update(user.id, user);
        } else {
            await this.addUsage(apiKey, 'NOT_PAID_FEATURE', 0);
        }
    }

    async addUsage(apiKey: APIKey, feature: string, point: number): Promise<APIFeatureUsage> {
        const newUsage = new APIFeatureUsage();
        newUsage.feature = feature;
        newUsage.usagePoint = point;
        newUsage.apiKey = apiKey;
        return await this.usageRepository.save(this.usageRepository.create(newUsage));
    }

    async delete(id: string) {
        return await this.apiKeyRepository.update(id, { isDeleted: true });
    }
}