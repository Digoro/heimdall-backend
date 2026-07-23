import { BasicEntity } from "src/shared/model/basic.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductType } from "./product.dto";
import { CatalogItem } from "src/catalog/catalog.entity";
import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: 'TB_PRODUCT' })
export class Product extends BasicEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: ProductType, default: ProductType.SLC })
    type: ProductType;

    @Exclude()
    @Column({ type: 'jsonb', nullable: true })
    filePath: {
        data: string;
        metadata: string;
        thumbnail: string;
    };

    @Expose()
    @ApiProperty({
        example: {
            data: 'https://heimdall.kr/api/download/orders/bd243b7e-bbab-48f2-9cd4-74b5f9d48fae/files/data',
            metadata: 'https://heimdall.kr/api/download/orders/bd243b7e-bbab-48f2-9cd4-74b5f9d48fae/files/metadata',
            thumbnail: 'https://heimdall.kr/api/download/orders/bd243b7e-bbab-48f2-9cd4-74b5f9d48fae/files/thumbnail',
        }
    })
    @Column({ type: 'jsonb', nullable: true })
    downloadUrl: {
        data: string;
        metadata: string;
        thumbnail: string;
    };

    @OneToOne(() => CatalogItem, item => item.product)
    @JoinColumn()
    item: CatalogItem;
}