import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { Order } from "src/order/order.entity";
import { Product } from "src/product/product.entity";
import { BasicEntity } from "src/shared/model/basic.entity";
import { User } from "src/user/user.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { ImagingMode } from "./catalog.dto";

@Entity({ name: 'TB_CATALOG' })
export class Catalog extends BasicEntity {
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

    @ApiProperty({ example: "Seoul" })
    @Column({ length: 100 })
    target: string;

    @ApiProperty({ example: "VV" })
    @Column({ length: 50 })
    polarization: string;

    @ApiProperty({ example: "0.5m" })
    @Column({ length: 50 })
    resolution: string;

    @ApiProperty({ example: "EPSG:4326" })
    @Column({ length: 50 })
    projection: string;

    @ApiProperty({ example: "GDAL GeoTransform (6 parameters)" })
    @Column({ length: 150 })
    geoTransform: string;

    @ApiProperty({ example: "5.2" })
    @Column()
    nadirAngle: number;

    @ApiProperty({ example: "5.2" })
    @Column()
    offNadirAngle: number;

    @ApiProperty({ example: "Band 1: Red, Band 2: Green" })
    @Column({ length: 150 })
    bandColorInterp: string;

    @Exclude()
    @OneToOne(() => User, user => user.orders)
    @JoinColumn()
    user: User;

    @Exclude()
    @OneToOne(() => Product, product => product.catalog)
    @JoinColumn()
    product: Product;

    @Exclude()
    @OneToMany(() => Order, order => order.catalog)
    orders: Order[];
}