import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { ImagingMode } from "src/catalog/catalog.dto";
import { Order } from "src/order/order.entity";
import { BasicEntity } from "src/shared/model/basic.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Geometry, LookSide, OrbitDirection as OrbitDirection, Polarization, Priority } from "./imaging.dto";

@Entity({ name: 'TB_IMAGING' })
export class Imaging extends BasicEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // geometry
    @Expose()
    @ApiProperty()
    @Column({ type: 'geometry', spatialFeatureType: 'Polygon', srid: 4326, nullable: true })
    geometry: Geometry;

    // property
    @Expose()
    @ApiProperty({ example: 'First SAR Imaging Request' })
    @Column({ length: 100, nullable: true, comment: '촬영 요청 이름' })
    name: string;

    @Expose()
    @ApiProperty({ example: 'SAR Imaging Request #1' })
    @Column({ length: 500, nullable: true, comment: '촬영 요청 설명' })
    description: string;

    @Expose()
    @ApiProperty({ example: Priority.STANDARD })
    @Column({ type: 'enum', enum: Priority, default: Priority.STANDARD, comment: '촬영 우선순위' })
    priority: Priority;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ type: 'timestamp with time zone', comment: '가장 빠른 촬영 시간' })
    windowOpen: Date;

    @Expose()
    @ApiProperty({ example: new Date().toISOString() })
    @Column({ type: 'timestamp with time zone', comment: '가장 나중 촬영 시간' })
    windowClose: Date;

    // property.constraint
    @Expose()
    @ApiProperty({ example: ImagingMode.SPOTLIGHT_SINGLE })
    @Column({ type: 'enum', enum: ImagingMode, default: ImagingMode.SPOTLIGHT_SINGLE, comment: '촬영 모드' })
    imagingMode: ImagingMode;

    @Expose()
    @ApiProperty({ example: Polarization.HH })
    @Column({ type: 'enum', enum: Polarization, default: Polarization.HH, comment: '편파' })
    polarization: Polarization;

    @Expose()
    @ApiProperty({ example: 0.5 })
    @Column({ type: 'float', default: 0.5, comment: '해상도' })
    resolution: number;

    @Expose()
    @ApiProperty({ example: 15 })
    @Column({ type: 'float', comment: '최소 촬영 입사각' })
    minIncidenceAngle: number;

    @Expose()
    @ApiProperty({ example: 35 })
    @Column({ type: 'float', comment: '최대 촬영 입사각' })
    maxIncidenceAngle: number;

    @Expose()
    @ApiProperty({ example: LookSide.LEFT })
    @Column({ type: 'enum', enum: LookSide, default: LookSide.LEFT, comment: '위성이 바라보는 방향' })
    lookSide: LookSide;

    @Expose()
    @ApiProperty({ example: OrbitDirection.ASENDING })
    @Column({ type: 'enum', enum: OrbitDirection, default: OrbitDirection.ASENDING, comment: '촬영 시 궤도 방향' })
    orbitDirection: OrbitDirection;

    @OneToMany(() => Order, order => order.imaging)
    orders: Order[];
}