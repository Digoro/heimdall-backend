import { ApiProperty } from "@nestjs/swagger";
import { Imaging } from "src/imaging/imaging.entity";
import { ProductType } from "src/product/product.dto";
import { BasicEntity } from "src/shared/model/basic.entity";
import { User } from "src/user/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
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
    @ApiProperty({ example: 'http://downloads.oms.com/q=fq8934fQ2NIO3F' })
    @Column({ type: 'jsonb', nullable: true })
    downloadUrl: {
        data: string;
        metadata: string;
        thumbnail: string;
    };

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ nullable: true })
    receivedAt: Date;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ nullable: true })
    estimatingAt: Date;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ nullable: true })
    rejectedAt: Date;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ nullable: true })
    pendingAt: Date;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ nullable: true })
    canceledAt: Date;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ nullable: true })
    approvedAt: Date;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ nullable: true })
    scheduledAt: Date;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ nullable: true })
    collectingAt: Date;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ nullable: true })
    processingAt: Date;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ nullable: true })
    failedAt: Date;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ nullable: true })
    qaAt: Date;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ nullable: true })
    deliveredAt: Date;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ nullable: true })
    estimatedDeliveryDate: Date;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ nullable: true })
    estimatedCollectionDate: Date;

    @ManyToOne(() => User, entity => entity.orders)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Expose()
    @ApiProperty({ type: () => CatalogItem, required: false })
    @ManyToOne(() => CatalogItem, entity => entity.orders)
    @JoinColumn({ name: 'itemId' })
    item?: CatalogItem;

    @Expose()
    @ApiProperty({ type: () => Imaging, required: false })
    @ManyToOne(() => Imaging, entity => entity.orders)
    @JoinColumn({ name: 'imagingId' })
    imaging?: Imaging;
}