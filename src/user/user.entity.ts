import { Exclude } from "class-transformer";
import { APIFeatureUsage } from "src/api/api.entity";
import { Order } from "src/order/order.entity";
import { BasicEntity } from "src/shared/model/basic.entity";
import { BeforeInsert, Column, Entity, OneToMany } from "typeorm";
import { Role } from "./user.dto";
const bcrypt = require('bcrypt');

@Entity({ name: 'TB_USER' })
export class User extends BasicEntity {
    @Column({ unique: true, length: 255 })
    email: string;

    @Exclude()
    @Column({ nullable: true, type: 'text' })
    password: string;

    @Column({ length: 50 })
    name: string;

    @Column({ length: 100 })
    department: string;

    @Column({ type: 'enum', enum: Role, default: Role.USER })
    role: Role;

    @Column({ default: 0 })
    dailyLimit: number;

    @Column({ default: 0 })
    dailyUsage: number;

    @Column({ default: 0 })
    monthlyLimit: number;

    @Column({ default: 0 })
    monthlyUsage: number;

    @OneToMany(() => Order, entity => entity.user)
    orders: Order[];

    @OneToMany(() => APIFeatureUsage, entity => entity.user)
    apiFeatureUsageList: APIFeatureUsage[];

    @BeforeInsert()
    async beforeInsert() {
        if (this.password) this.password = await bcrypt.hash(this.password, 12);
    }

    comparePassword(attempPassword: string): boolean {
        return bcrypt.compare(attempPassword, this.password);
    }
}