import { ApiProperty } from "@nestjs/swagger";
import { Catalog } from "src/catalog/catalog.entity";
import { Imaging } from "src/imaging/imaging.entity";
import { ProductLevel } from "src/product/product.dto";
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
    @ApiProperty({ example: ProductLevel.L1A })
    @Column({ type: 'enum', enum: ProductLevel, default: ProductLevel.L1A })
    productLevel: ProductLevel;

    @Expose()
    @ApiProperty({ example: OrderStatus.Pending })
    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
    status: OrderStatus;

    @Expose()
    @ApiProperty({ example: 'http://downloads.oms.com/q=fq8934fQ2NIO3F' })
    @Column({ type: 'text', nullable: true })
    downloadUrl: string;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ nullable: true })
    exportedAt: Date;

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