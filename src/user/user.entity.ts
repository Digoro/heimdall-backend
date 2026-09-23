import { Exclude } from "class-transformer";
import { APIKey } from "src/apiKey/api.entity";
import { Order } from "src/order/order.entity";
import { BasicEntity } from "src/shared/model/basic.entity";
import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./user.dto";
import { OrderStatus } from "src/order/order.dto";
import { Cart } from "src/cart/cart.entity";
const bcrypt = require('bcrypt');

@Entity({ name: 'TB_Tier' })
export class Tier extends BasicEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    code: string;

    @Column()
    name: string;

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => TierPolicy, entity => entity.tier)
    tierPolicies: TierPolicy[];

    @OneToMany(() => User, entity => entity.tier)
    users: User[];
}

@Entity({ name: 'TB_TierPolicy' })
export class TierPolicy extends BasicEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tier, entity => entity.tierPolicies)
    @JoinColumn({ name: 'tierId' })
    tier: Tier;

    @Column()
    policyCode: string;

    @Column()
    policyName: string;

    @Column()
    dataType: string;

    @Column()
    validatorType: string;

    @Column()
    validatorConfig: string;

    @Column({ type: 'jsonb' })
    value: any;

    @Column({ default: true })
    isActive: boolean;
}

@Entity({ name: 'TB_USER' })
@Index(['email', 'deletedAt'], { unique: true })
export class User extends BasicEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    refreshToken: string;

    @Column({ length: 255 })
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

    @Column({ default: 5000 })
    dailyLimit: number;

    @Column({ default: 0 })
    dailyUsage: number;

    @Column({ default: 100000 })
    monthlyLimit: number;

    @Column({ default: 0 })
    monthlyUsage: number;

    @Column({ default: false })
    isApproved: boolean;

    @Column({ nullable: true })
    webhookUrl: string;

    @Column({ nullable: true })
    webhookSecret: string;

    @Column({ default: false })
    isDeleted: boolean;

    @Column({ type: 'timestamp with time zone', default: null })
    deletedAt: Date;

    @OneToMany(() => Order, entity => entity.user)
    orders: Order[];

    @OneToMany(() => APIKey, entity => entity.user)
    apiKeys: APIKey[];

    @OneToOne(() => Cart, entity => entity.user)
    cart: Cart;

    @ManyToOne(() => Tier, entity => entity.users)
    @JoinColumn({ name: 'tierId' })
    tier: Tier;

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

    @Column({ type: 'jsonb', nullable: true })
    error: object;

    @Column({ default: true })
    success: boolean;

    @Column({ default: 1 })
    attemp: number;
}
