import { Catalog } from "src/catalog/catalog.entity";
import { Imaging } from "src/imaging/imaging.entity";
import { ProductLevel } from "src/product/product.dto";
import { BasicEntity } from "src/shared/model/basic.entity";
import { User } from "src/user/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { OrderStatus, OrderType } from "./order.dto";

@Entity({ name: 'TB_ORDER' })
export class Order extends BasicEntity {
    @Column({ type: 'enum', enum: OrderType, default: OrderType.ARCHVING_ORDER })
    type: OrderType;

    @Column({ type: 'enum', enum: ProductLevel, default: ProductLevel.L1A })
    productLevel: ProductLevel;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
    status: OrderStatus;

    @Column({ type: 'text' })
    downloadUrl: string;

    @Column({ nullable: true })
    exportedAt: Date;

    @Column({ nullable: true })
    pendingAt: Date;

    @Column({ nullable: true })
    approvedAt: Date;

    @Column({ nullable: true })
    rejectedAt: Date;

    @Column({ nullable: true })
    completedAt: Date;

    @Column({ nullable: true })
    failedAt: Date;

    @Column({ nullable: true })
    canceledAt: Date;

    @ManyToOne(() => User, entity => entity.orders, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Catalog, entity => entity.orders, { nullable: true })
    @JoinColumn({ name: 'catalogId' })
    catalog: Catalog;

    @ManyToOne(() => Imaging, entity => entity.orders, { nullable: true })
    @JoinColumn({ name: 'imagingId' })
    imaging: Imaging;
}