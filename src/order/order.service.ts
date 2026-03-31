import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { APIService } from 'src/apiKey/api.service';
import { Repository } from 'typeorm';
import { ArchvingOrderRequestDto, OrderSearchDto, OrderStatus, OrderType, OrderUpdateDto, TaskingOrderRequestDto } from './order.dto';
import { Order } from './order.entity';
import { CatalogService } from 'src/catalog/catalog.service';
import { ImagingService } from 'src/imaging/imaging.service';
import { Imaging } from 'src/imaging/imaging.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order) private orderRepository: Repository<Order>,
        private apiService: APIService,
        private catalogService: CatalogService,
        private imagingService: ImagingService,
        private userService: UserService
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

    async updateStatus(id: number, dto: OrderUpdateDto): Promise<any> {
        const order = await this.findById(id);

        switch (dto.status) {
            case OrderStatus.PENDING: {
                await this.orderRepository.update(id, { status: dto.status, pendingAt: new Date() });
                break;
            }
            case OrderStatus.APPROVED: {
                await this.orderRepository.update(id, { status: dto.status, approvedAt: new Date() });
                break;
            }
            case OrderStatus.REJECTED: {
                await this.orderRepository.update(id, { status: dto.status, rejectedAt: new Date() });
                break;
            }
            case OrderStatus.COMPLETED: {
                await this.orderRepository.update(id, { status: dto.status, completedAt: new Date() });
                break;
            }
            case OrderStatus.FAILED: {
                await this.orderRepository.update(id, { status: dto.status, failedAt: new Date() });
                break;
            }
            case OrderStatus.CANCELED: {
                await this.orderRepository.update(id, { status: dto.status, canceledAt: new Date() });
                break;
            }
        }

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
            productType: dto.productType
        } as Order));

        return await this.get(order.id);
    }

    async taksingOrder(key: string, dto: TaskingOrderRequestDto) {
        const apiKey = (await this.apiService.findByKey(key))!;

        const newImaging = new Imaging();
        newImaging.geometry = dto.geometry;
        newImaging.name = dto.properties.name;
        newImaging.description = dto.properties.description;
        newImaging.priority = dto.properties.priority;
        newImaging.windowOpen = dto.properties.windowOpen;
        newImaging.windowClose = dto.properties.windowClose;
        newImaging.imagingMode = dto.properties.collectConstraint.imagingMode;
        newImaging.polarization = dto.properties.collectConstraint.polarization;
        newImaging.resolution = dto.properties.collectConstraint.resolution;
        newImaging.minIncidenceAngle = dto.properties.collectConstraint.minIncidenceAngle;
        newImaging.maxIncidenceAngle = dto.properties.collectConstraint.maxIncidenceAngle;
        newImaging.lookSide = dto.properties.collectConstraint.lookSide;
        newImaging.orbitDirection = dto.properties.collectConstraint.orbitDirection;
        const imaging = await this.imagingService.add(newImaging);

        const newOrder = await this.orderRepository.save(this.orderRepository.create({
            type: OrderType.TASKING_ORDER,
            user: { id: apiKey.user.id },
            imaging: { id: imaging.id },
            productType: dto.properties.productType
        } as Order));

        return await this.get(newOrder.id);
    }

    async cancel(key: string, id: number) {
        const apiKey = (await this.apiService.findByKey(key))!;
        const user = (await this.userService.findById(apiKey.user.id))!;
        const order = await this.orderRepository.createQueryBuilder('order')
            .leftJoin('order.user', 'user')
            .where('order.id = :orderId', { orderId: id })
            .andWhere('user.id = :userId', { userId: user.id })
            .getExists();

        if (order) {
            await this.orderRepository.update(id, { status: OrderStatus.CANCELED, canceledAt: new Date() });
            return { message: 'Order canceled successful.' }
        } else {
            throw new NotFoundException();
        }
    }
}