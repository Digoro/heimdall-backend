import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { ImagingMode } from "src/catalog/catalog.dto";
import { Order } from "src/order/order.entity";
import { BasicEntity } from "src/shared/model/basic.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity({ name: 'TB_IMAGING' })
export class Imaging extends BasicEntity {
    @ApiProperty({ example: ImagingMode.Stripmap })
    @Column({ type: 'enum', enum: ImagingMode, default: ImagingMode.Stripmap })
    imagingMode: ImagingMode;

    @ApiProperty({ example: new Date().toISOString() })
    @Column()
    imagingStartAt: Date;

    @ApiProperty({ example: new Date().toISOString() })
    @Column()
    imagingEndAt: Date;

    @ApiProperty({
        example: {
            topLeft: { x: 50, y: 100 },
            topRight: { x: 50, y: 100 },
            bottomLeft: { x: 50, y: 100 },
            bottomRight: { x: 50, y: 100 },
        }
    })
    @Column({ type: 'jsonb' })
    cornerCoordinates: {
        topLeft: { x: number; y: number };
        topRight: { x: number; y: number };
        bottomLeft: { x: number; y: number };
        bottomRight: { x: number; y: number };
    };

    @Exclude()
    @OneToMany(() => Order, order => order.imaging)
    orders: Order[];
}