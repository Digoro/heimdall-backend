import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { APIService } from 'src/apiKey/api.service';
import { Repository } from 'typeorm';
import { ArchiveOrderRequestDto, OrderSearchDto, OrderStatus, OrderType, OrderUpdateDto, TaskOrderRequestDto } from './order.dto';
import { Order } from './order.entity';
import { ImagingService } from 'src/imaging/imaging.service';
import { Imaging } from 'src/imaging/imaging.entity';
import { UserService } from 'src/user/user.service';
import { CatalogService } from 'src/catalog/catalog.service';
import { WebhookService } from 'src/user/webhook.service';
import { WebhookExtra } from 'src/user/user.dto';

@Injectable()
export class OrderService {

    constructor(
        @InjectRepository(Order) private orderRepository: Repository<Order>,
        private apiService: APIService,
        private collectionService: CatalogService,
        private imagingService: ImagingService,
        private userService: UserService,
        private webhookService: WebhookService
    ) { }

    async get(id: string): Promise<Order> {
        const order = await this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.user', 'user')
            .leftJoinAndSelect('order.item', 'item')
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
            .leftJoinAndSelect('order.item', 'item')
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
            .leftJoinAndSelect('order.item', 'item')
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

    async updateStatus(orderId: string, userId: string, dto: OrderUpdateDto): Promise<any> {
        const order = (await this.findById(orderId))!;

        switch (dto.status) {
            case OrderStatus.RECEIVED: {
                await this.orderRepository.update(orderId, { status: dto.status, receivedAt: new Date() });
                break;
            }
            case OrderStatus.ESTIMATING: {
                await this.orderRepository.update(orderId, { status: dto.status, estimatingAt: new Date() });
                break;
            }
            case OrderStatus.REJECTED: {
                await this.orderRepository.update(orderId, { status: dto.status, rejectedAt: new Date() });
                break;
            }
            case OrderStatus.PENDING: {
                await this.orderRepository.update(orderId, { status: dto.status, pendingAt: new Date() });
                break;
            }
            case OrderStatus.CANCELED: {
                await this.orderRepository.update(orderId, { status: dto.status, canceledAt: new Date() });
                break;
            }
            case OrderStatus.APPROVED: {
                await this.orderRepository.update(orderId, { status: dto.status, approvedAt: new Date() });
                break;
            }
            case OrderStatus.SCHEDULED: {
                await this.orderRepository.update(orderId, { status: dto.status, scheduledAt: new Date() });
                break;
            }
            case OrderStatus.COLLECTING: {
                await this.orderRepository.update(orderId, { status: dto.status, collectingAt: new Date() });
                break;
            }
            case OrderStatus.PROCESSING: {
                await this.orderRepository.update(orderId, { status: dto.status, processingAt: new Date() });
                break;
            }
            case OrderStatus.FAILED: {
                await this.orderRepository.update(orderId, { status: dto.status, failedAt: new Date() });
                break;
            }
            case OrderStatus.QA: {
                await this.orderRepository.update(orderId, { status: dto.status, qaAt: new Date() });
                break;
            }
            case OrderStatus.DELIVERED: {
                await this.orderRepository.update(orderId, { status: dto.status, deliveredAt: new Date() });
                break;
            }
        }

        const extra: WebhookExtra = {
            estimatedDeliveryDate: order.estimatedDeliveryDate,
            estimatedCollectionDate: order.estimatedCollectionDate,
        };

        if (dto.status == OrderStatus.DELIVERED) {
            extra.download = order.downloadUrl;
        }

        await this.webhookService.notify(orderId, userId, dto.status, extra);

        return await this.get(order!.id);
    }

    async findById(id: string): Promise<Order | null> {
        return await this.orderRepository.findOneBy({ id })
    }

    async archiveOrder(key: string, dto: ArchiveOrderRequestDto) {
        const apiKey = (await this.apiService.findByKey(key))!;
        const item = await this.collectionService.getItem(dto.collectionId, dto.itemId, false);
        if (!item) throw new NotFoundException();

        const order = await this.orderRepository.save(this.orderRepository.create({
            type: OrderType.ARCHIVE,
            user: { id: apiKey.user.id },
            item: { id: item.id },
            productType: dto.productType
        } as Order));

        return await this.get(order.id);
    }

    async taskOrder(key: string, dto: TaskOrderRequestDto) {
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
            type: OrderType.TASK,
            user: { id: apiKey.user.id },
            imaging: { id: imaging.id },
            productType: dto.properties.productType
        } as Order));

        return await this.get(newOrder.id);
    }

    async cancel(key: string, id: string) {
        const apiKey = (await this.apiService.findByKey(key))!;
        const user = (await this.userService.findById(apiKey.user.id))!;
        const order = await this.orderRepository.createQueryBuilder('order')
            .leftJoin('order.user', 'user')
            .where('order.id = :orderId', { orderId: id })
            .andWhere('user.id = :userId', { userId: user.id })
            .getOne();

        if (order) {
            await this.updateStatus(id, order.user.id, { status: OrderStatus.CANCELED });
            return { message: 'Order canceled successful.' }
        } else {
            throw new NotFoundException();
        }
    }

    async approve(key: string, id: string) {
        const apiKey = (await this.apiService.findByKey(key))!;
        const user = (await this.userService.findById(apiKey.user.id))!;
        const order = await this.orderRepository.createQueryBuilder('order')
            .leftJoin('order.user', 'user')
            .where('order.id = :orderId', { orderId: id })
            .andWhere('user.id = :userId', { userId: user.id })
            .getOne();

        if (order) {
            await this.updateStatus(id, order.user.id, { status: OrderStatus.APPROVED });
            return { message: 'Order canceled successful.' }
        } else {
            throw new NotFoundException();
        }
    }
}