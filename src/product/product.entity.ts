import { Exclude } from "class-transformer";
import { Catalog } from "src/catalog/catalog.entity";
import { BasicEntity } from "src/shared/model/basic.entity";
import { Column, Entity, OneToOne } from "typeorm";
import { ProductLevel } from "./product.dto";

@Entity({ name: 'TB_PRODUCT' })
export class Product extends BasicEntity {
    @Column({ type: 'enum', enum: ProductLevel, default: ProductLevel.L1A })
    productLevel: ProductLevel;

    @Column({ type: 'text' })
    thumbnail: string;

    @Column({ type: 'text' })
    filePath: string;

    @Column({ length: 50 })
    fileFormat: string;

    @Exclude()
    @OneToOne(() => Catalog, catalog => catalog.product)
    catalog: Catalog;
}