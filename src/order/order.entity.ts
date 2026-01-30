import { Catalog } from "src/catalog/catalog.entity";
import { Imaging } from "src/imaging/imaging.entity";
import { ProductLevel } from "src/product/product.dto";
import { BasicEntity } from "src/shared/model/basic.entity";
import { User } from "src/user/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { OrderStatus, OrderType } from "./order.dto";

@Entity({ name: 'order' })
export class Order extends BasicEntity {
    @Column({ type: 'enum', enum: OrderType, default: OrderType.ProductOrder })
    type: OrderType;

    @Column({ type: 'enum', enum: ProductLevel, default: ProductLevel.L1A })
    productLevel: ProductLevel;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
    status: OrderStatus;

    @Column({ nullable: true })
    exportedAt: Date;

    @Column({ nullable: true })
    lastDownloadedAt: Date;

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

    @OneToOne(() => User, user => user.order)
    @JoinColumn()
    user: User;

    @ManyToOne(() => Catalog, catalog => catalog.orders, { nullable: true })
    @JoinColumn()
    catalog: Catalog;

    @ManyToOne(() => Imaging, imaging => imaging.orders, { nullable: true })
    @JoinColumn()
    imaging: Imaging;
}