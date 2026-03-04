import { ImagingMode } from "src/catalog/catalog.dto";
import { Order } from "src/order/order.entity";
import { BasicEntity } from "src/shared/model/basic.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity({ name: 'TB_IMAGING' })
export class Imaging extends BasicEntity {
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

    @OneToMany(() => Order, order => order.imaging)
    orders: Order[];
}