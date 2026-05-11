import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CatalogCollection } from "./catalog.entity";

@Injectable()
export class CollectionSeed implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(CatalogCollection) private readonly collectionRepository
    ) { }

    async onApplicationBootstrap() {
        await this.seed();
    }

    private async seed() {
        const exist = await this.collectionRepository.findOne({
            where: { collectionId: 'cosmos' }
        });

        if (exist) return;

        await this.collectionRepository.save({
            collectionId: 'cosmos',
            type: 'Collection',
            stacVersion: '1.0.0',
            title: 'COSMOS SAR Satellite',
            description: 'COSMOS SAR satellite imagery collection',
            license: 'proprietary',
            extent: {
                spatial: {
                    bbox: [[-180, -90, 180, 90]]
                },
                temporal: {
                    interval: [['2026-04-22T00:00:00', null]]
                }
            },
            summaries: {
                platform: [
                    'stripmap',
                    'scansar',
                    'spotlight_single',
                    'spotlight_dwell',
                    'spotlight_single_uhr',
                    'spotlight_dwell_uhr'
                ],
                'sar:product_type': ['SLC', 'GEC', 'GEO'],
            }
        });

        console.log('Collection seed completed');
    }
}