import { Exclude } from "class-transformer";
import { AOI } from "src/aoi/aoi.entity";
import { Order } from "src/order/order.entity";
import { BasicEntity } from "src/shared/model/basic.entity";
import { Column, Entity, OneToMany, OneToOne } from "typeorm";
import { Role } from "./user.dto";

@Entity({ name: 'user' })
export class User extends BasicEntity {
    @Column({ unique: true, length: 255 })
    email: string;

    @Exclude()
    @Column({ length: 255 })
    password: string;

    @Column({ length: 50 })
    name: string;

    @Column({ length: 100 })
    department: string;

    @Column({ type: 'enum', enum: Role, default: Role.USER })
    role: Role;

    @OneToOne(() => Order, order => order.user)
    order: Order;

    @OneToMany(() => AOI, aoi => aoi.user)
    aois: AOI[];
}