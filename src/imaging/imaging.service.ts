import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Imaging } from './imaging.entity';

@Injectable()
export class ImagingService {
    constructor(
        @InjectRepository(Imaging) private imagingRepository: Repository<Imaging>,
    ) { }

    async get(id: string): Promise<Imaging> {
        const imaging = await this.imagingRepository.createQueryBuilder('imaging')
            .where('imaging.id = :id', { id }).getOne();
        if (!imaging) {
            throw new NotFoundException();
        }
        return imaging;
    }

    async add(dto: Imaging): Promise<Imaging> {
        const imaging = await this.imagingRepository.save(this.imagingRepository.create(dto));
        return imaging;
    }
}