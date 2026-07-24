import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderService } from 'src/order/order.service';
import * as path from 'path';
import * as fs from 'fs';
import { CatalogService } from 'src/catalog/catalog.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import { OrderStatus } from 'src/order/order.dto';
import { CatalogItem } from 'src/catalog/catalog.entity';
import { Metadata, MetadataImage } from './product.dto';

@Injectable()
export class ProductService {
    private basePath: string;
    private baseUrl: string;

    constructor(
        private configService: ConfigService,
        private orderService: OrderService,
        private catalogService: CatalogService,
        @InjectRepository(Product) private productRepository: Repository<Product>,
    ) {
        this.basePath = this.configService.getOrThrow<string>('STORAGE_BASE_PATH');
        this.baseUrl = this.configService.get<string>('API_BASE_URL')!;
    }

    async uploadProductFiles(orderId: string, files: {
        data?: Express.Multer.File[];
        metadata?: Express.Multer.File[];
        thumbnail?: Express.Multer.File[];
    }) {
        if (!files.data || !files.metadata || !files.thumbnail) {
            throw new BadRequestException('All three files (data, metadata, thumbnail) are required');
        }
        const order = await this.orderService.findByIdWithUser(orderId);
        if (!order) {
            throw new NotFoundException('order not founded');
        }

        const dataFile = files.data[0];
        const metadataFile = files.metadata[0];
        const thumbnailFile = files.thumbnail[0];

        // ItemId 추출 (data 파일명에서 확장자 제거)
        const itemId = path.basename(dataFile.originalname, path.extname(dataFile.originalname));

        // NAS 저장
        const destDir = path.join(this.basePath, 'items', itemId);
        await fs.promises.mkdir(destDir, { recursive: true });

        const fileMap = {
            data: dataFile,
            metadata: metadataFile,
            thumbnail: thumbnailFile
        }

        const savedFilePaths: Record<string, string> = {};
        const savedDownloadUrls: Record<string, string> = {};
        const errors: string[] = [];

        for (const [type, file] of Object.entries(fileMap)) {
            const absolutePath = path.join(destDir, file.originalname);

            try {
                await this.moveFile(file.path, absolutePath);
                savedFilePaths[type] = absolutePath;
                savedDownloadUrls[type] = `${this.baseUrl}/api/download/orders/${orderId}/files/${type}`;
            } catch (error) {
                errors.push(error);
                await fs.promises.unlink(file.path).catch(() => { });
            }
        }

        if (errors.length > 0) {
            throw new BadRequestException(`Upload failed for: ${errors.join(', ')}`);
        }

        // Item 등록
        const raw = await fs.promises.readFile(savedFilePaths.metadata, 'utf-8');
        const metadata = JSON.parse(raw) as Metadata;
        const image = metadata.Image;

        let item = await this.catalogService.getItemById(itemId);
        if (!item) {
            const collection = await this.catalogService.getCollectionById('cosmos');
            const newItem = new CatalogItem();
            newItem.itemId = itemId;
            newItem.type = 'Feature';
            newItem.stacVersion = '1.0.0';
            newItem.collection = 'cosmos';
            newItem.geometry = this.buildGeometry(image);
            newItem.bbox = this.buildBbox(image);
            newItem.properties = this.buildProperties(metadata);
            newItem.collectionEntity = collection!;
            item = await this.catalogService.addItem(newItem);

            item.assets = {
                data: { type: 'image/tiff', roles: ['data'] },
                metadata: { type: 'application/json', roles: ['metadata'] },
                thumbnail: {
                    type: 'image/png',
                    roles: ['thumbnail'],
                    href: `${this.baseUrl}/api/download/catalog/${item.itemId}/files/thumbnail`
                },

            };
            await this.catalogService.updateItem(item);
        }

        // Product 등록
        const product = await this.productRepository.createQueryBuilder('product')
            .where('product.itemId = :itemId', { itemId: item.id })
            .getOne();

        if (product) {
            await this.productRepository.update(product.id, {
                filePath: savedFilePaths,
                downloadUrl: savedDownloadUrls
            });
        } else {
            await this.productRepository.save({
                type: order.productType,
                filePath: savedFilePaths,
                downloadUrl: savedDownloadUrls,
                item
            });
        }

        // Order 업데이트
        await this.orderService.update(orderId, { deliveredItem: item! });
        await this.orderService.updateStatus(orderId, { status: OrderStatus.DELIVERED });

        return {
            itemId,
            status: OrderStatus.DELIVERED,
            message: 'All files uploaded, order has been delivered'
        }
    }

    private async moveFile(src: string, dest: string): Promise<void> {
        await fs.promises.mkdir(path.dirname(dest), { recursive: true });
        await fs.promises.copyFile(src, dest);
        await fs.promises.unlink(src);
    }

    private buildGeometry(image: MetadataImage) {
        const nearEarly = image.Near_Early_Geodetic_Coordinates;
        const nearLate = image.Near_Late_Geodetic_Coordinates;
        const farEarly = image.Far_Early_Geodetic_Coordinates;
        const farLate = image.Far_Late_Geodetic_Coordinates;

        const coordinates = [[
            [nearEarly[1], nearEarly[0]],
            [nearLate[1], nearLate[0]],
            [farEarly[1], farEarly[0]],
            [farLate[1], farLate[0]],
            [nearEarly[1], nearEarly[0]],
        ]];

        return {
            type: 'Polygon',
            coordinates
        };
    }

    private buildBbox(image: MetadataImage) {
        const lons = [
            image.Near_Early_Geodetic_Coordinates[1],
            image.Near_Late_Geodetic_Coordinates[1],
            image.Far_Early_Geodetic_Coordinates[1],
            image.Far_Late_Geodetic_Coordinates[1]
        ];
        const lats = [
            image.Near_Early_Geodetic_Coordinates[0],
            image.Near_Late_Geodetic_Coordinates[0],
            image.Far_Early_Geodetic_Coordinates[0],
            image.Far_Late_Geodetic_Coordinates[0]
        ];

        return [
            Math.min(...lons),
            Math.min(...lats),
            Math.max(...lons),
            Math.max(...lats),
        ];
    }

    private buildProperties(data: Metadata): any {
        const { General, SARParameter, Image } = data;
        return {
            title: '',
            mission: General.Mission_ID,
            platform: General.Satellite_ID,
            datetime: new Date(Number(General.Scene_Sensing_Center_UTC) * 1000).toISOString(),
            start_datetime: new Date(Number(General.Scene_Sensing_Start_UTC) * 1000).toISOString(),
            end_datetime: new Date(Number(General.Scene_Sensing_Stop_UTC) * 1000).toISOString(),
            instruments: ['sar'],

            // SAR Extension
            'sar:product_type': this.buildProductType(General.Product_Type),
            'sar:instrument_mode': General.Acquisition_Mode,
            'sar:observation_direction': General.Look_Side,
            'sar:polarizations': [SARParameter.Polarization],
            'sar:center_frequency': SARParameter.Center_Frequency,
            'sar:pixel_spacing_range': Image.Range_Spacing,
            'sar:pixel_spacing_azimuth': Image.Line_Spacing,
            'sar:looks_range': Image.Range_Looks,
            'sar:looks_azimuth': Image.Azimuth_Looks,

            // View Extension
            'view:incidence_angle': SARParameter.Incidence_Angle,

            // Satellite Extension
            'sat:orbit_state': General.Orbit_Direction,

            // COSMOS Extension
            'cosmos:sample_format': General.Sample_Format,
            'cosmos:datetime': General.Datetime,
            'cosmos:antenna_length': General.Antenna_Length,
            'cosmos:antenna_beamwidth': General.Antenna_Beamwidth,
            'cosmos:reference_utc': General.Referenced_UTC,
            'cosmos:number_of_state_vectors': General.Number_of_State_Vectors,
            'cosmos:state_vector_times': General.State_Vectors_Times,
            'cosmos:attitude_quaternions': General.Attitude_Quaternions,
            'cosmos:ecef_satellite_position': General.ECEF_Satellite_Position,
            'cosmos:ecef_satellite_velocity': General.ECEF_Satellite_Velocity,
            'cosmos:roll_angle': General.Roll_Angle,
            'cosmos:yaw_angle': General.Yaw_Angle,
            'cosmos:pitch_angle': General.Pitch_Angle,
            'cosmos:heading': General.Heading,
            'cosmos:echo_sampling_window_length': SARParameter.Echo_Sampling_Window_Length,
            'cosmos:prf': SARParameter.PRF,
            'cosmos:range_chirp_length': SARParameter.Range_Chirp_Length,
            'cosmos:range_chirp_rate': SARParameter.Range_Chirp_Rate,
            'cosmos:rank': SARParameter.Rank,
            'cosmos:sampling_rate': SARParameter.Sampling_Rate,
            'cosmos:range_first_time': SARParameter.Range_First_Time,
            'cosmos:range_samples': SARParameter.Range_Samples,
            'cosmos:azimuth_lines': SARParameter.Azimuth_Lines,
            'cosmos:doppler_bandwidth': SARParameter.Doppler_Bandwidth,
            'cosmos:doppler_polynomial': SARParameter.Doppler_Polynomial,
            'cosmos:doppler_polynomial_dot': SARParameter.Doppler_Polynomial_Dot,
            'cosmos:effective_velocity': SARParameter.Effective_Velocity,
            'cosmos:range_focusing_bandwidth': SARParameter.Range_Focusing_Bandwidth,
            'cosmos:center_latitude': Image.Center_Lattitude,
            'cosmos:center_longitude': Image.Center_Longitude,
            'cosmos:near_range_slc': Image.Near_Range_SLC,
            'cosmos:center_range_slc': Image.Center_Range_SLC,
            'cosmos:far_range_slc': Image.Far_Range_SLC,
            'cosmos:far_incidence_angle': Image.Far_Incidence_Angle,
            'cosmos:near_incidence_angle': Image.Near_Incidence_Angle,
            'cosmos:center_incidence_angle': Image.Center_Incidence_Angle,
            'cosmos:far_look_angle': Image.Far_Look_Angle,
            'cosmos:near_look_angle': Image.Near_Look_Angle
        }
    }

    private buildProductType(type: string) {
        if (type == 'SSC') {
            return 'SLC'
        } else if (type == 'GEC') {
            return 'GEC';
        } else if (type == 'GTC') {
            return 'GEO';
        }
    }

    async findByDeliverdItemId(itemId: string): Promise<Product | null> {
        return this.productRepository.createQueryBuilder('product')
            .where('product.item = :itemId', { itemId })
            .getOne();
    }
}