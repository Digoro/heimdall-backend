import { ApiProperty } from "@nestjs/swagger";
import { Imaging } from "src/imaging/imaging.entity";
import { ProductType } from "src/product/product.dto";
import { BasicEntity } from "src/shared/model/basic.entity";
import { User } from "src/user/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderStatus, OrderType } from "./order.dto";
import { Expose } from "class-transformer";
import { CatalogItem } from "src/catalog/catalog.entity";

@Entity({ name: 'TB_ORDER' })
export class Order extends BasicEntity {
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Expose()
    @ApiProperty({ example: OrderType.ARCHIVE })
    @Column({ type: 'enum', enum: OrderType, default: OrderType.ARCHIVE })
    type: OrderType;

    @Expose()
    @ApiProperty({ example: ProductType.SLC })
    @Column({ type: 'enum', enum: ProductType, default: ProductType.SLC })
    productType: ProductType;

    @Expose()
    @ApiProperty({ example: OrderStatus.RECEIVED })
    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.RECEIVED })
    status: OrderStatus;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ type: 'timestamp with time zone', nullable: true })
    estimatedDeliveryDate: Date;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ type: 'timestamp with time zone', nullable: true })
    estimatedCollectionDate: Date;

    @ManyToOne(() => User, entity => entity.orders)
    @JoinColumn({ name: 'userId' })
    user: User;

    // 주문 시 사용자가 본 카탈로그 Item
    @Expose()
    @ApiProperty({ type: () => CatalogItem, required: false })
    @ManyToOne(() => CatalogItem, entity => entity.orders)
    referencedItem: CatalogItem;

    @Expose()
    @ApiProperty({ type: () => Imaging, required: false })
    @ManyToOne(() => Imaging, entity => entity.orders)
    @JoinColumn({ name: 'imagingId' })
    imaging?: Imaging;

    // 실제로 납품된 카탈로그 Item, 영상 업로드 등록하면 추가됨
    @Expose()
    @ApiProperty({ type: () => CatalogItem, required: false })
    @ManyToOne(() => CatalogItem, entity => entity.orders)
    deliveredItem: CatalogItem;

    @Expose()
    @ApiProperty({ type: () => [OrderStatusHistory] })
    @OneToMany(() => OrderStatusHistory, entity => entity.order)
    statusHistory: OrderStatusHistory[];
}

@Entity({ name: 'TB_ORDER_STATUS_HISTORY' })
export class OrderStatusHistory extends BasicEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Order, entity => entity.statusHistory)
    @JoinColumn({ name: 'orderId' })
    order: Order;

    @Expose()
    @ApiProperty({ example: OrderStatus.ESTIMATING })
    @Column({ type: 'enum', enum: OrderStatus })
    fromStatus: OrderStatus;

    @Expose()
    @ApiProperty({ example: OrderStatus.REJECTED })
    @Column({ type: 'enum', enum: OrderStatus })
    toStatus: OrderStatus;

    @Expose()
    @ApiProperty({ example: "Mission conflict" })
    @Column({ nullable: true })
    reason: string;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @CreateDateColumn({ type: 'timestamp with time zone' })
    changedAt: Date;
}