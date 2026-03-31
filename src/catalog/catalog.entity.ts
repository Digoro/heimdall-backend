import { ApiProperty } from "@nestjs/swagger";
import { Order } from "src/order/order.entity";
import { Product } from "src/product/product.entity";
import { BasicEntity } from "src/shared/model/basic.entity";
import { User } from "src/user/user.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { ImagingMode } from "./catalog.dto";
import { Expose } from "class-transformer";
import { Geometry } from "src/imaging/imaging.dto";

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
    @ApiProperty()
    @Column({ type: 'geometry', spatialFeatureType: 'Polygon', srid: 4326, nullable: true })
    geometry: Geometry;

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
    @Column({ comment: 'lookAngle과 비슷한 개념' })
    offNadirAngle: number;

    @OneToOne(() => User, user => user.orders)
    @JoinColumn()
    user: User;

    @OneToOne(() => Product, product => product.catalog)
    @JoinColumn()
    product: Product;

    @OneToMany(() => Order, order => order.catalog)
    orders: Order[];
}