import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { APIService } from 'src/apiKey/api.service';
import { Repository } from 'typeorm';
import { ArchiveOrderRequestDto, OrderSearchDto, OrderStatus, OrderType, OrderStatusUpdateDto, TaskOrderRequestDto } from './order.dto';
import { Order, OrderStatusHistory } from './order.entity';
import { ImagingService } from 'src/imaging/imaging.service';
import { Imaging } from 'src/imaging/imaging.entity';
import { UserService } from 'src/user/user.service';
import { CatalogService } from 'src/catalog/catalog.service';
import { WebhookService } from 'src/user/webhook.service';
import { MailService } from 'src/user/mail.service';

@Injectable()
export class OrderService {

    constructor(
        @InjectRepository(Order) private orderRepository: Repository<Order>,
        @InjectRepository(OrderStatusHistory) private orderHistoryRepository: Repository<OrderStatusHistory>,
        private apiService: APIService,
        private collectionService: CatalogService,
        private imagingService: ImagingService,
        private userService: UserService,
        private mailService: MailService,
        private webhookService: WebhookService
    ) { }

    async get(id: string, options?: { includeUser?: boolean }): Promise<Order> {
        const qb = this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.referencedItem', 'referencedItem')
            .leftJoinAndSelect('order.deliveredItem', 'deliveredItem')
            .leftJoinAndSelect('order.imaging', 'imaging')
            .leftJoinAndSelect('order.statusHistory', 'statusHistory')
            .where('order.id = :id', { id })

        if (options?.includeUser) {
            qb.leftJoinAndSelect('order.user', 'user')
        }

        const order = await qb.getOne();
        if (!order) {
            throw new NotFoundException();
        }
        return order;
    }

    async search(dto: OrderSearchDto): Promise<Pagination<Order>> {
        const options = { page: dto.page, limit: dto.limit };
        const query = this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.user', 'user')
            .leftJoinAndSelect('order.referencedItem', 'referencedItem')
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
        const items = await Promise.all(
            results.items.map(async (order) => {
                const history = await this.orderHistoryRepository.createQueryBuilder('history')
                    .where('history.order = :order', { order: order.id })
                    .getMany();
                order.statusHistory = history;
                return order;
            }));
        return {
            items: items,
            meta: results.meta
        }
    }

    async searchByAPIKey(key: string, dto: OrderSearchDto): Promise<Pagination<Order>> {
        const apiKey = (await this.apiService.findByKey(key))!;
        const options = { page: dto.page, limit: dto.limit };
        const query = this.orderRepository.createQueryBuilder('order')
            .leftJoin('order.user', 'user')
            .leftJoinAndSelect('order.referencedItem', 'referencedItem')
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
        const items = await Promise.all(
            results.items.map(async (order) => {
                const history = await this.orderHistoryRepository.createQueryBuilder('history')
                    .where('history.order = :order', { order: order.id })
                    .getMany();
                order.statusHistory = history;
                return order;
            }));
        return {
            items: items,
            meta: results.meta
        }
    }

    async updateStatus(orderId: string, dto: OrderStatusUpdateDto): Promise<any> {
        const order = (await this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.user', 'user')
            .where('order.id = :id', { id: orderId })
            .getOne())!;

        if (dto.estimatedCollectionDate) {
            await this.orderRepository.update(orderId, { estimatedCollectionDate: dto.estimatedCollectionDate });
        }

        if (dto.estimatedDeliveryDate) {
            await this.orderRepository.update(orderId, { estimatedDeliveryDate: dto.estimatedDeliveryDate });
        }

        await this.orderRepository.update(orderId, { status: dto.status });

        await this.orderHistoryRepository.save({
            order,
            fromStatus: order.status,
            toStatus: dto.status,
            reason: dto.reason
        } as OrderStatusHistory);

        await this.webhookService.notify(orderId, order.user.id);

        return await this.get(order!.id);
    }

    async update(orderId: string, order: any) {
        return await this.orderRepository.update(orderId, order);
    }

    async findByIdWithUser(id: string): Promise<Order | null> {
        return await this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.user', 'user')
            .where('order.id = :id', { id })
            .getOne();
    }

    async findByIdWithDelieverdItem(id: string): Promise<Order | null> {
        return await this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.deliveredItem', 'deliveredItem')
            .where('order.id = :id', { id })
            .getOne();
    }

    async archiveOrder(key: string, dto: ArchiveOrderRequestDto) {
        const apiKey = (await this.apiService.findByKey(key))!;
        const item = await this.collectionService.getItem(dto.collectionId, dto.itemId, false);

        const order = await this.orderRepository.save(this.orderRepository.create({
            type: OrderType.ARCHIVE,
            user: { id: apiKey.user.id },
            referencedItem: { id: item.id },
            productType: dto.productType
        } as Order));

        // TODO: 관리자 이메일 전송
        // await this.mailService.sendOrderNotification(order);
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

        // TODO: 관리자 이메일 전송
        // await this.mailService.sendOrderNotification(newOrder);
        return await this.get(newOrder.id);
    }

    async cancel(key: string, id: string) {
        const apiKey = (await this.apiService.findByKey(key))!;
        const user = (await this.userService.findById(apiKey.user.id))!;
        const order = await this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.user', 'user')
            .where('order.id = :orderId', { orderId: id })
            .andWhere('user.id = :userId', { userId: user.id })
            .getOne();

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.status != OrderStatus.PENDING) {
            throw new BadRequestException('Order can only be canceled when in pending status')
        }

        await this.updateStatus(id, order.user.id, { status: OrderStatus.CANCELED });
        return { message: 'Order canceled successful.' }
    }

    async approve(key: string, id: string) {
        const apiKey = (await this.apiService.findByKey(key))!;
        const user = (await this.userService.findById(apiKey.user.id))!;
        const order = await this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.user', 'user')
            .where('order.id = :orderId', { orderId: id })
            .andWhere('user.id = :userId', { userId: user.id })
            .getOne();

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.status != OrderStatus.PENDING) {
            throw new BadRequestException('Order can only be approved when in pending status')
        }

        await this.updateStatus(id, order.user.id, { status: OrderStatus.APPROVED });
        return { message: 'Order approved successful.' }
    }
}