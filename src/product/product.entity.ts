import { BasicEntity } from "src/shared/model/basic.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductType } from "./product.dto";
import { CatalogItem } from "src/catalog/catalog.entity";

@Entity({ name: 'TB_PRODUCT' })
export class Product extends BasicEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: ProductType, default: ProductType.SLC })
    productType: ProductType;

    @Column({ type: 'text' })
    thumbnail: string;

    @Column({ type: 'text' })
    filePath: string;

    @Column({ length: 50 })
    fileFormat: string;

    @OneToOne(() => CatalogItem, item => item.product)
    item: CatalogItem;
}