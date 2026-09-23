import { BasicEntity } from "src/shared/model/basic.entity";
import { Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Expose } from "class-transformer";
import { User } from "src/user/user.entity";
import { CartItem } from "./cart-item.entity";

@Entity({ name: 'TB_CART' })
export class Cart extends BasicEntity {
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, entity => entity.cart)
    user: User;

    @OneToMany(() => CartItem, entity => entity.cart)
    items: CartItem[];
}
