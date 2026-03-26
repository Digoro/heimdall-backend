import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { ImagingMode } from "src/catalog/catalog.dto";
import { Order } from "src/order/order.entity";
import { BasicEntity } from "src/shared/model/basic.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { CornerCoordinates } from "./imaging.dto";

@Entity({ name: 'TB_IMAGING' })
export class Imaging extends BasicEntity {
    @Expose()
    @ApiProperty({ example: ImagingMode.Stripmap })
    @Column({ type: 'enum', enum: ImagingMode, default: ImagingMode.Stripmap })
    imagingMode: ImagingMode;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column()
    imagingStartAt: Date;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column()
    imagingEndAt: Date;

    @Expose()
    @ApiProperty({
        example: {
            topLeft: { x: 50, y: 100 },
            topRight: { x: 50, y: 100 },
            bottomLeft: { x: 50, y: 100 },
            bottomRight: { x: 50, y: 100 },
        }
    })
    @Column({ type: 'jsonb' })
    cornerCoordinates: CornerCoordinates;

    @OneToMany(() => Order, order => order.imaging)
    orders: Order[];
}