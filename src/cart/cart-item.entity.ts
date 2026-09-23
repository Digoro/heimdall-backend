import { BasicEntity } from "src/shared/model/basic.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Expose } from "class-transformer";
import { Cart } from "./cart.entity";

@Entity({ name: 'TB_CART_ITEM' })
export class CartItem extends BasicEntity {
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Cart, entity => entity.items)
    @JoinColumn({ name: 'cartId' })
    cart: Cart;
}

