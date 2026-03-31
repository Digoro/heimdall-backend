import { ApiProperty } from "@nestjs/swagger";
import { Catalog } from "src/catalog/catalog.entity";
import { Imaging } from "src/imaging/imaging.entity";
import { ProductType } from "src/product/product.dto";
import { BasicEntity } from "src/shared/model/basic.entity";
import { User } from "src/user/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { OrderStatus, OrderType } from "./order.dto";
import { Expose } from "class-transformer";

@Entity({ name: 'TB_ORDER' })
export class Order extends BasicEntity {
    @Expose()
    @ApiProperty({ example: OrderType.ARCHVING_ORDER })
    @Column({ type: 'enum', enum: OrderType, default: OrderType.ARCHVING_ORDER })
    type: OrderType;

    @Expose()
    @ApiProperty({ example: ProductType.SLC })
    @Column({ type: 'enum', enum: ProductType, default: ProductType.SLC })
    productType: ProductType;

    @Expose()
    @ApiProperty({ example: OrderStatus.PENDING })
    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;

    @Expose()
    @ApiProperty({ example: 'http://downloads.oms.com/q=fq8934fQ2NIO3F' })
    @Column({ type: 'text', nullable: true })
    downloadUrl: string;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ nullable: true })
    pendingAt: Date;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ nullable: true })
    approvedAt: Date;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ nullable: true })
    rejectedAt: Date;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ nullable: true })
    completedAt: Date;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ nullable: true })
    failedAt: Date;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ nullable: true })
    canceledAt: Date;

    @ManyToOne(() => User, entity => entity.orders)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Expose()
    @ApiProperty({ type: () => Catalog })
    @ManyToOne(() => Catalog, entity => entity.orders)
    @JoinColumn({ name: 'catalogId' })
    catalog: Catalog;

    @Expose()
    @ApiProperty({ type: () => Imaging })
    @ManyToOne(() => Imaging, entity => entity.orders)
    @JoinColumn({ name: 'imagingId' })
    imaging: Imaging;
}