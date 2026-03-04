import { Order } from "src/order/order.entity";
import { Product } from "src/product/product.entity";
import { BasicEntity } from "src/shared/model/basic.entity";
import { User } from "src/user/user.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { ImagingMode } from "./catalog.dto";

@Entity({ name: 'TB_CATALOG' })
export class Catalog extends BasicEntity {
    @Column({ type: 'enum', enum: ImagingMode, default: ImagingMode.Stripmap })
    imagingMode: ImagingMode;

    @Column()
    imagingStartAt: Date;

    @Column()
    imagingEndAt: Date;

    @Column({ type: 'jsonb' })
    cornerCoordinates: {
        topLeft: { x: number; y: number };
        topRight: { x: number; y: number };
        bottomLeft: { x: number; y: number };
        bottomRight: { x: number; y: number };
    };

    @Column({ length: 100 })
    target: string;

    @Column({ length: 50 })
    polarization: string;

    @Column({ length: 50 })
    resolution: string;

    @Column({ length: 50 })
    projection: string;

    @Column({ length: 150 })
    geoTransform: string;

    @Column()
    nadirAngle: number;

    @Column()
    offNadirAngle: number;

    @Column({ length: 150 })
    bandColorInterp: string;

    @OneToOne(() => User, user => user.orders)
    @JoinColumn()
    user: User;

    @OneToOne(() => Product, product => product.catalog)
    @JoinColumn()
    product: Product;

    @OneToMany(() => Order, order => order.catalog)
    orders: Order[];
}