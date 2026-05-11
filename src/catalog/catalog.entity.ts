import { ApiProperty } from "@nestjs/swagger";
import { BasicEntity } from "src/shared/model/basic.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Expose } from "class-transformer";
import { Product } from "src/product/product.entity";
import { Order } from "src/order/order.entity";

export class SpatialExtent {
    @ApiProperty({ example: [[-180, -90, 180, 90]] })
    bbox: number[][];
}

export class TemporalExtent {
    @ApiProperty({ example: [['2026-04-22T00:00:00Z', null]] })
    interval: (string | null)[][];
}

export class Extent {
    @ApiProperty({ type: () => SpatialExtent })
    spatial: SpatialExtent;

    @ApiProperty({ type: () => TemporalExtent })
    temporal: TemporalExtent;
}

export class Summaries {
    @ApiProperty({ example: ['stripmap', 'scansar', 'spotlight_single', 'spotlight_dwell', 'spotlight_single_uhr', 'spotlight_dwell_uhr'] })
    platform: string[];

    @ApiProperty({ example: ['SLC', 'GEC', 'GEO'] })
    'sar:product_type': string[];
}

@Entity({ name: 'TB_CATALOG_COLLECTION' })
export class CatalogCollection extends BasicEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Expose()
    @ApiProperty({ description: 'Unique identifier for the STAC Collection', example: 'cosmos' })
    @Column({ unique: true })
    collectionId: string;

    @Expose()
    @ApiProperty({ description: 'STAC object type, always Collection', example: 'Collection' })
    @Column({ default: 'Collection' })
    type: string;

    @Expose()
    @ApiProperty({ description: 'Version of the STAC specification', example: '1.0.0' })
    @Column({ default: '1.0.0' })
    stacVersion: string;

    @Expose()
    @ApiProperty({ description: 'Human readable name of the collection', example: 'COSMOS SAR Satellite' })
    @Column()
    title: string;

    @Expose()
    @ApiProperty({ description: 'Detailed description of the collection', example: 'COSMOS SAR satellite imagery collection', required: false })
    @Column({ nullable: true })
    description: string;

    @Expose()
    @ApiProperty({ description: 'License of the data in the collection', example: 'proprietary' })
    @Column({ default: 'proprietary' })
    license: string;

    @Expose()
    @ApiProperty({ description: 'Spatial and temporal extents covered by the collection', type: () => Extent })
    @Column({ type: 'jsonb' })
    extent: {
        spatial: { bbox: number[][] },
        temporal: {
            interval: (string | null)[][]
        }
    }

    @Expose()
    @ApiProperty({ description: 'Summary of property values available in the collection items', type: () => Summaries })
    @Column({ type: 'jsonb', nullable: true })
    summaries: object;

    @ApiProperty({ description: 'Realted links' })
    @Expose()
    links?: object[];

    @OneToMany(() => CatalogItem, item => item.collectionEntity)
    items: CatalogItem[];
}

@Entity({ name: 'TB_CATALOG_ITEM' })
export class CatalogItem extends BasicEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Expose()
    @ApiProperty({ description: 'Unique identifier for the STAC Item', example: 'COSMOS_2026042201_SM_SLC_VV_20260422100000_20260422100025' })
    @Column({ unique: true })
    itemId: string;

    @Expose()
    @ApiProperty({ description: 'STAC object type, always Feature', example: 'Feature' })
    @Column({ default: 'Feature' })
    type: string;

    @Expose()
    @ApiProperty({ description: 'Version of the STAC specification', example: '1.0.0' })
    @Column({ default: '1.0.0' })
    stacVersion: string;

    @Expose()
    @ApiProperty({ description: 'Collection ID this item belongs to', example: 'cosmos' })
    @Column()
    collection: string;

    @Expose()
    @ApiProperty({ description: 'Footprint of the item as GeoJSON Polygon' })
    @Column({ type: 'geometry', spatialFeatureType: 'Polygon', srid: 4326 })
    geometry: object;

    @Expose()
    @ApiProperty({ description: 'Bounding box of the item [minLon, minLat, maxLon, maxLat]', example: [126.9, 37.4, 127.1, 37.6] })
    @Column({ type: 'float', array: true })
    bbox: number[];

    @Expose()
    @ApiProperty({ description: 'Item properties' })
    @Column({ type: 'jsonb' })
    properties: {
        title: string;
        datetime: string;
        start_datetime: string;
        end_datetime: string;
        platform: string;
        mission: string;
        instruments: string;

        // SAR Extension
        'sar:instrument_mode': string;
        'sar:product_type': string;
        'sar:frequency_band': string;
        'sar:center_frequency': number;
        'sar:polarizations': string[];
        'sar:observation_direction': string;
        'sar:pixel_spacing_range': number;
        'sar:pixel_spacing_azimuth': number;
        'sar:looks_range': number;
        'sar:looks_azimuth': number;
        'sar:beam_ids': string[];

        // View Extension
        'view:look_direction': string;
        'view:azimuth': number;
        'view:incidence_angle': number;

        // Satellite Extension
        'sat:orbit_state': string;

        // Cosmos
        'cosmos:resolution': number;
    };

    @Expose()
    @ApiProperty({ description: 'Asset files associated with the item' })
    @Column({ type: 'jsonb' })
    assets: {
        thumbnail?: { href: string, type: string, title: string, roles: string[] };
        data?: { href: string, type: string, title: string, roles: string[] };
        metadata?: { href: string, type: string, title: string, roles: string[] };
    }

    @ApiProperty({ description: 'Realted links' })
    @Expose()
    links?: object[];

    @ManyToOne(() => CatalogCollection, collection => collection.items)
    @JoinColumn({ name: 'collection_id' })
    collectionEntity: CatalogCollection;

    @OneToOne(() => Product, product => product.item)
    @JoinColumn()
    product: Product;

    @OneToMany(() => Order, order => order.item)
    orders: Order[];
}