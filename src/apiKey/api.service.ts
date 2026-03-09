import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { Pagination, paginate } from 'nestjs-typeorm-paginate';
import { AuthService } from 'src/auth/auth.service';
import { PaginationSearchDto } from 'src/shared/interface/pagination.dto';
import { Repository } from 'typeorm';
import { CreateAPIKeyDto, ResponseCreateAPIKey, UpdateAPIKeyDto } from './api.dto';
import { APIKey } from './api.entity';

@Injectable()
export class APIService {
    constructor(
        @InjectRepository(APIKey) private apiKeyRepository: Repository<APIKey>,
        public authService: AuthService
    ) { }

    async search(dto: PaginationSearchDto): Promise<Pagination<APIKey>> {
        const options = { page: dto.page, limit: dto.limit };
        const query = this.apiKeyRepository.createQueryBuilder('apiKey')
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

    async create(userId: number, dto: CreateAPIKeyDto): Promise<ResponseCreateAPIKey> {
        const user = (await this.authService.findById(userId))!;
        const key = this.generateAPIKey();
        const hashKey = this.hashAPIKey(key);
        const maskKey = this.maskAPIKey(key);
        const newAPIKey = dto.toEntity(user, hashKey, maskKey);
        await this.apiKeyRepository.save(this.apiKeyRepository.create(newAPIKey));
        return { key, maskKey };
    }

    async update(id: number, dto: UpdateAPIKeyDto): Promise<{ status: string }> {
        const apiKey = await this.findById(id);
        const newApiKey = await this.apiKeyRepository.save(Object.assign(apiKey, dto));
        return { status: newApiKey.status };
    }

    async findById(id: number): Promise<APIKey> {
        const apiKey = (await this.apiKeyRepository.findOneBy({ id }))!;
        return apiKey;
    }

    async delete(id: number) {
        this.apiKeyRepository.delete(id);
    }
}