import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Catalog } from './catalog.entity';

@Injectable()
export class CatalogService {
    constructor(
        @InjectRepository(Catalog) private catalogRepository: Repository<Catalog>,
    ) { }

    async get(id: number): Promise<Catalog> {
        return (await this.catalogRepository.findOneBy({ id }))!;
    }
}