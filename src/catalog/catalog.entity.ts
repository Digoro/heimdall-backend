import { ApiProperty } from "@nestjs/swagger";
import { Order } from "src/order/order.entity";
import { Product } from "src/product/product.entity";
import { BasicEntity } from "src/shared/model/basic.entity";
import { User } from "src/user/user.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { ImagingMode } from "./catalog.dto";
import { Expose } from "class-transformer";
import { CornerCoordinates } from "src/imaging/imaging.dto";

@Entity({ name: 'TB_CATALOG' })
export class Catalog extends BasicEntity {
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

    @Expose()
    @ApiProperty({ example: "Seoul" })
    @Column({ length: 100 })
    target: string;

    @Expose()
    @ApiProperty({ example: "VV" })
    @Column({ length: 50 })
    polarization: string;

    @Expose()
    @ApiProperty({ example: "0.5m" })
    @Column({ length: 50 })
    resolution: string;

    @Expose()
    @ApiProperty({ example: "EPSG:4326" })
    @Column({ length: 50 })
    projection: string;

    @Expose()
    @ApiProperty({ example: "GDAL GeoTransform (6 parameters)" })
    @Column({ length: 150 })
    geoTransform: string;

    @Expose()
    @ApiProperty({ example: "5.2" })
    @Column()
    nadirAngle: number;

    @Expose()
    @ApiProperty({ example: "5.2" })
    @Column()
    offNadirAngle: number;

    @Expose()
    @ApiProperty({ example: "Band 1: Red, Band 2: Green" })
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