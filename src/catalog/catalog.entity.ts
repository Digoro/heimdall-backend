import { ApiProperty } from "@nestjs/swagger";
import { BasicEntity } from "src/shared/model/basic.entity";
import { BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
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
    @ApiProperty({ example: ['stripmap', 'scansar', 'spotlight_single', 'spotlight_dwell', 'spotlight_dwell_fixedprf', 'spotlight_single_uhr', 'spotlight_dwell_uhr', 'spotlight_dwell_uhr_fixedprf'] })
    platform: string[];

    @ApiProperty({ example: ['SLC', 'GEC', 'GEO'] })
    'sar:product_type': string[];
}

@Entity({ name: 'TB_CATALOG_COLLECTION' })
export class CatalogCollection {
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

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @BeforeUpdate()
    updateTimestamp() {
        this.updatedAt = new Date;
    }
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
    @ApiProperty({ description: 'A list of extensions the Item implements', example: '["https://stac-extensions.github.io/sar/v1.0.0/schema.json]' })
    stacExtensions: string[];

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
        mission: string;
        platform: string;
        datetime: string;
        start_datetime: string;
        end_datetime: string;
        instruments: string[]; // ["sar"] 

        // SAR Extension
        'sar:product_type': string;
        'sar:instrument_mode': string;
        'sar:observation_direction': string;
        'sar:polarizations': string[];
        'sar:center_frequency': number;
        'sar:pixel_spacing_range': number;
        'sar:pixel_spacing_azimuth': number;
        'sar:looks_range': number;
        'sar:looks_azimuth': number;

        // View Extension
        'view:incidence_angle': number;

        // Satellite Extension
        'sat:orbit_state': string;

        // COSMOS Extension
        'cosmos:sample_format': number;
        'cosmos:scene_sensing_center_utc': number;
        'cosmos:antenna_length': number;
        'cosmos:antenna_beamwidth': number;
        'cosmos:reference_utc': number;
        'cosmos:number_of_state_vectors': number;
        'cosmos:state_vector_times': number;
        'cosmos:attitude_quaternions': number;
        'cosmos:ecef_satellite_position': number;
        'cosmos:ecef_satellite_velocity': number;
        'cosmos:roll_angle': number;
        'cosmos:yaw_angle': number;
        'cosmos:pitch_angle': number;
        'cosmos:heading': number;
        'cosmos:echo_sampling_window_length': number;
        'cosmos:prf': number;
        'cosmos:range_chirp_length': number;
        'cosmos:range_chirp_rate': number;
        'cosmos:rank': number;
        'cosmos:sampling_rate': number;
        'cosmos:range_first_time': number;
        'cosmos:range_samples': number;
        'cosmos:azimuth_lines': number;
        'cosmos:doppler_bandwidth': number;
        'cosmos:doppler_polynomial': number;
        'cosmos:doppler_polynomial_dot': number;
        'cosmos:effective_velocity': number;
        'cosmos:range_focusing_bandwidth': number;
        'cosmos:center_latitude': number;
        'cosmos:center_longitude': number;
        'cosmos:near_range_slc': number;
        'cosmos:center_range_slc': number;
        'cosmos:far_range_slc': number;
        'cosmos:far_incidence_angle': number;
        'cosmos:near_incidence_angle': number;
        'cosmos:center_incidence_angle': number;
        'cosmos:far_look_angle': number;
        'cosmos:near_look_angle': number;
    };

    @Expose()
    @ApiProperty({ description: 'Asset files associated with the item' })
    @Column({ type: 'jsonb', nullable: true })
    assets: {
        thumbnail?: { type: string, roles: string[], href: string };
        data?: { type: string, roles: string[] };
        metadata?: { type: string, roles: string[] };
    }

    @ApiProperty({ description: 'Realted links' })
    @Expose()
    links?: object[];

    @ManyToOne(() => CatalogCollection, collection => collection.items)
    @JoinColumn({ name: 'collection_id' })
    collectionEntity: CatalogCollection;

    @OneToOne(() => Product, product => product.item)
    product: Product;

    @OneToMany(() => Order, order => order.referencedItem)
    orders: Order[];
}