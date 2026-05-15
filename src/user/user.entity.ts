import { Exclude } from "class-transformer";
import { APIKey } from "src/apiKey/api.entity";
import { Order } from "src/order/order.entity";
import { BasicEntity } from "src/shared/model/basic.entity";
import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./user.dto";
import { OrderStatus } from "src/order/order.dto";
const bcrypt = require('bcrypt');

@Entity({ name: 'TB_USER' })
export class User extends BasicEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    refreshToken: string;

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

    @Column({ default: 100 })
    dailyLimit: number;

    @Column({ default: 0 })
    dailyUsage: number;

    @Column({ default: 500 })
    monthlyLimit: number;

    @Column({ default: 0 })
    monthlyUsage: number;

    @Column({ default: false })
    isApproved: boolean;

    @Column({ nullable: true })
    webhookUrl: string;

    @Column({ nullable: true })
    webhookSecret: string;

    @OneToMany(() => Order, entity => entity.user)
    orders: Order[];

    @OneToMany(() => APIKey, entity => entity.user)
    apiKeys: APIKey[];

    @BeforeInsert()
    async beforeInsert() {
        if (this.password) this.password = await bcrypt.hash(this.password, 12);
    }

    comparePassword(attempPassword: string): boolean {
        return bcrypt.compare(attempPassword, this.password);
    }
}

@Entity({ name: 'TB_WEBHOOK_LOG' })
export class WebhookLog extends BasicEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    orderId: string;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.RECEIVED })
    status: OrderStatus;

    @Column({ type: 'jsonb' })
    payload: object;

    @Column({ nullable: true })
    responseCode: number;

    @Column({ default: true })
    success: boolean;

    @Column({ default: 1 })
    attemp: number;
}