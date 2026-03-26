import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { APIService } from 'src/apiKey/api.service';
import { Repository } from 'typeorm';
import { ArchvingOrderRequestDto, OrderSearchDto, OrderType, OrderUpdateDto, TaskingOrderRequestDto } from './order.dto';
import { Order } from './order.entity';
import { CatalogService } from 'src/catalog/catalog.service';
import { ImagingService } from 'src/imaging/imaging.service';
import { Imaging } from 'src/imaging/imaging.entity';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order) private orderRepository: Repository<Order>,
        private apiService: APIService,
        private catalogService: CatalogService,
        private imagingService: ImagingService
    ) { }

    async get(id: number): Promise<Order> {
        const order = await this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.user', 'user')
            .leftJoinAndSelect('order.catalog', 'catalog')
            .leftJoinAndSelect('order.imaging', 'imaging')
            .where('order.id = :id', { id }).getOne();
        if (!order) {
            throw new NotFoundException();
        }
        return order;
    }

    async search(dto: OrderSearchDto): Promise<Pagination<Order>> {
        const options = { page: dto.page, limit: dto.limit };
        const query = this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.user', 'user')
            .leftJoinAndSelect('order.catalog', 'catalog')
            .leftJoinAndSelect('order.imaging', 'imaging')
            .orderBy('order.createdAt', 'DESC')
        if (dto?.email) {
            query.andWhere('user.email like :keyword', { keyword: `%${dto.email}%` })
        }
        if (dto?.statusList?.length > 0) {
            query.andWhere('order.status in (:...statusList)', { statusList: dto.statusList })
        }
        if (dto?.typeList?.length > 0) {
            query.andWhere('order.type in (:...typeList)', { typeList: dto.typeList })
        }

        const results = await paginate<Order>(query, options);
        return results;
    }

    async searchByAPIKey(key: string, dto: OrderSearchDto): Promise<Pagination<Order>> {
        const apiKey = (await this.apiService.findByKey(key))!;
        const options = { page: dto.page, limit: dto.limit };
        const query = this.orderRepository.createQueryBuilder('order')
            .leftJoin('order.user', 'user')
            .leftJoinAndSelect('order.catalog', 'catalog')
            .leftJoinAndSelect('order.imaging', 'imaging')
            .where('user.id = :userId', { userId: apiKey.user.id })
            .orderBy('order.createdAt', 'DESC')
        if (dto?.statusList?.length > 0) {
            query.andWhere('order.status in (:...statusList)', { statusList: dto.statusList })
        }
        if (dto?.typeList?.length > 0) {
            query.andWhere('order.type in (:...typeList)', { typeList: dto.typeList })
        }

        const results = await paginate<Order>(query, options);
        return results;
    }

    async update(id: number, dto: OrderUpdateDto): Promise<any> {
        const order = await this.findById(id);
        await this.orderRepository.save(Object.assign(order!, dto))
        return await this.get(order!.id);
    }

    async findById(id: number): Promise<Order | null> {
        return await this.orderRepository.findOneBy({ id })
    }

    async archvingOrder(key: string, dto: ArchvingOrderRequestDto) {
        const apiKey = (await this.apiService.findByKey(key))!;
        const catalog = await this.catalogService.get(dto.catalogId);
        if (!catalog) throw new NotFoundException();

        const order = await this.orderRepository.save(this.orderRepository.create({
            type: OrderType.ARCHVING_ORDER,
            user: { id: apiKey.user.id },
            catalog: { id: dto.catalogId },
            productLevel: dto.productLevel
        }));

        return await this.get(order.id);
    }

    async taksingOrder(key: string, dto: TaskingOrderRequestDto) {
        const apiKey = (await this.apiService.findByKey(key))!;

        const newImaging = new Imaging();
        newImaging.imagingMode = dto.properties.collectConstraint.imagingMode;
        newImaging.imagingStartAt = dto.properties.windowOpen;
        newImaging.imagingEndAt = dto.properties.windowClose;
        newImaging.cornerCoordinates = dto.geometry.cornerCoordinates;
        const imaging = await this.imagingService.add(newImaging);

        return await this.orderRepository.save(this.orderRepository.create({
            type: OrderType.TASKING_ORDER,
            user: { id: apiKey.user.id },
            imaging: { id: imaging.id },
            productLevel: dto.properties.collectConstraint.productLevel
        }));
    }
}