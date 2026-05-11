import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CatalogCollection, CatalogItem } from './catalog.entity';
import { plainToInstance } from 'class-transformer';
import { SearchDto } from './catalog.dto';

@Injectable()
export class CatalogService {
    constructor(
        @InjectRepository(CatalogCollection) private collectionRepository: Repository<CatalogCollection>,
        @InjectRepository(CatalogItem) private itemRepository: Repository<CatalogItem>,
        private configuration: ConfigService
    ) { }

    private get baseUrl(): string {
        return this.configuration.get<string>('API_BASE_URL')!;
    }

    async getCollections() {
        const collections = await this.collectionRepository.find();

        return {
            collections: collections.map(c => this.serialize(c)),
            link: [
                { rel: 'self', href: `${this.baseUrl}/catalog/collections` },
                { rel: 'root', href: `${this.baseUrl}/catalog` }
            ]
        }
    }

    async getCollection(collectionId: string) {
        const collection = await this.collectionRepository.findOne({
            where: { collectionId }
        });

        if (!collection) {
            throw new NotFoundException(`Collection not found: ${collectionId}`);
        }

        return this.serialize(collection);
    }

    private serialize(collection: CatalogCollection) {
        collection.links = [
            { rel: 'self', href: `${this.baseUrl}/catalog/collections/${collection.collectionId}` },
            { rel: 'items', href: `${this.baseUrl}/catalog/collections/${collection.collectionId}/items` },
            { rel: 'root', href: `${this.baseUrl}/catalog` },
        ]

        const result = plainToInstance(CatalogCollection, collection, {
            excludeExtraneousValues: true
        });

        return {
            ...result,
            id: collection.collectionId
        }
    }

    async getItems(collectionId: string, page = 1, limit = 10) {
        await this.validateCollection(collectionId);

        const [items, total] = await this.itemRepository.findAndCount({
            where: { collection: collectionId },
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' }
        });

        return {
            type: 'FeatureCollection',
            features: items.map(i => this.serializeItem(i)),
            context: {
                returned: items.length,
                limit,
                matched: total,
                page,
            },
            links: [
                { rel: 'self', href: `${this.baseUrl}/catalog/collections/${collectionId}/items?page=${page}&limit=${limit}` },
                { rel: 'items', href: `${this.baseUrl}/catalog/collections/${collectionId}` },
                { rel: 'root', href: `${this.baseUrl}/catalog` },
                ... (page * limit < total ? [{ rel: 'next', href: `${this.baseUrl}/catalog/collections/${collectionId}/items?page=${page + 1}&limit=${limit}` }] : []),
                ... (page > 1 ? [{ rel: 'prev', href: `${this.baseUrl}/catalog/collections/${collectionId}/items?page=${page - 1}&limit=${limit}` }] : []),
            ]
        }
    }

    async getItem(collectionId: string, itemId: string, isSerialize = true) {
        await this.validateCollection(collectionId);

        const item = await this.itemRepository.findOne({
            where: { collection: collectionId, itemId }
        });
        if (!item) throw new NotFoundException(`Item not found: ${itemId}`);
        return isSerialize ? this.serializeItem(item) : item;
    }

    private async validateCollection(collectionId: string) {
        const exist = await this.collectionRepository.findOne({
            where: { collectionId }
        });

        if (!exist) throw new NotFoundException(`Collection not found ${collectionId}`);
    }

    private serializeItem(item: CatalogItem) {
        item.links = [
            { rel: 'self', href: `${this.baseUrl}/catalog/collections/${item.collection}/items` },
            { rel: 'items', href: `${this.baseUrl}/catalog/collections/${item.collection}` },
            { rel: 'root', href: `${this.baseUrl}/catalog` },
        ];

        return plainToInstance(CatalogItem, item, {
            excludeExtraneousValues: true
        });
    }

    async search(dto: SearchDto) {
        const { bbox, datetime, collections, ids, intersects, query, limit = 10, page = 1, sortBy } = dto;
        const qb = this.itemRepository.createQueryBuilder('item');

        if (dto?.ids?.length) {
            qb.where('item.itemId IN (:...ids)', { ids });
            const [items, total] = await qb.getManyAndCount();
            return this.toFeatureCollection(items, total, limit, page)
        }

        if (collections?.length) {
            qb.andWhere('item.collection IN (:...collections)', { collections });
        }

        if (bbox?.length === 4) {
            const [minLon, minLat, maxLon, maxLat] = bbox;
            qb.andWhere('ST_Intersects(item.geometry, ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326)', { minLon, minLat, maxLon, maxLat });
        }

        if (intersects) {
            qb.andWhere(`ST_Intersects(item.geometry, ST_GeomFromGeoJSON(:intersects))`, { intersects: JSON.stringify(intersects) });
        }

        if (datetime) {
            if (datetime.includes('/')) {
                const [start, end] = datetime.split('/');
                if (start && start !== '..') {
                    qb.andWhere(`item.properties ->> 'datetime' >= :start`, { start });
                }
                if (end && end !== '..') {
                    qb.andWhere(`item.properties ->> 'datetime' <= :end`, { end });
                }
            } else {
                qb.andWhere(`item.properties ->> 'datetime' = :datetime`, { datetime });
            }
        }

        if (query) {
            const numericField = new Set([
                'view:incidence_angle',
                'view:azimuth',
                'cosmos:resoultion',
                'sar:center_frequency',
                'sar:pixel_spacing_range',
                'sar:pixel_spacing_azimuth',
                'sar:looks_range',
                'sar:looks:azimuth'
            ]);
            Object.entries(query).forEach(([field, operators], i) => {
                const isNumeric = numericField.has(field);
                const jsonPath = isNumeric ? `CAST(item.properties ->> '${field}' AS float)` : `item.properties ->> '${field}'`;
                Object.entries(operators).forEach(([op, value]) => {
                    const param = `qv_${i}_${op}`;

                    switch (op) {
                        case 'eq': {
                            qb.andWhere(`${jsonPath} = :${param}`, { [param]: value });
                            break;
                        }
                        case 'neq': {
                            qb.andWhere(`${jsonPath} != :${param}`, { [param]: value });
                            break;
                        }
                        case 'gt': {
                            qb.andWhere(`${jsonPath} > :${param}`, { [param]: value });
                            break;
                        }
                        case 'gte': {
                            qb.andWhere(`${jsonPath} >= :${param}`, { [param]: value });
                            break;
                        }
                        case 'lt': {
                            qb.andWhere(`${jsonPath} < :${param}`, { [param]: value });
                            break;
                        }
                        case 'lte': {
                            qb.andWhere(`${jsonPath} <= :${param}`, { [param]: value });
                            break;
                        }
                        case 'in': {
                            qb.andWhere(`${jsonPath} IN (:...${param})`, { [param]: value });
                            break;
                        }
                        case 'startWith': {
                            qb.andWhere(`${jsonPath} LIKE :${param}`, { [param]: value });
                            break;
                        }
                    }
                });
            });
        }

        if (sortBy?.length) {
            sortBy.forEach(({ field, direction }) => {
                qb.addOrderBy(`item.properties ->> '${field}'`, direction.toUpperCase() as 'ASC' | 'DESC');
            })
        } else {
            qb.orderBy(`item.properties ->> 'datetime'`, 'DESC');
        }

        qb.skip((page - 1) * limit).take(limit);

        const [items, total] = await qb.getManyAndCount();
        return this.toFeatureCollection(items, total, limit, page);
    }

    private toFeatureCollection(items: CatalogItem[], total: number, limit: number, page: number) {
        return {
            type: 'FeatureCollection',
            features: items.map(i => this.serializeItem(i)),
            context: {
                returned: items.length,
                limit,
                matched: total,
                page
            },
            links: [
                { rel: 'self', href: `${this.baseUrl}/catalog/search` },
                { rel: 'root', href: `${this.baseUrl}/catalog` },
                ... (page * limit < total ? [{ rel: 'next', href: `${this.baseUrl}/catalog/search?page=${page + 1}&limit=${limit}` }] : []),
                ... (page > 1 ? [{ rel: 'next', href: `${this.baseUrl}/catalog/search?page=${page - 1}&limit=${limit}` }] : []),
            ]
        };
    }
}