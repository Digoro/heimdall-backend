import { Catalog } from "src/catalog/catalog.entity";
import { BasicEntity } from "src/shared/model/basic.entity";
import { Column, Entity, OneToOne } from "typeorm";
import { ProductType } from "./product.dto";

@Entity({ name: 'TB_PRODUCT' })
export class Product extends BasicEntity {
    @Column({ type: 'enum', enum: ProductType, default: ProductType.SLC })
    productType: ProductType;

    @Column({ type: 'text' })
    thumbnail: string;

    @Column({ type: 'text' })
    filePath: string;

    @Column({ length: 50 })
    fileFormat: string;

    @OneToOne(() => Catalog, catalog => catalog.product)
    catalog: Catalog;
}