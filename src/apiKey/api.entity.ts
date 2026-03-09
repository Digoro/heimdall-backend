import { Exclude } from "class-transformer";
import { BasicEntity } from "src/shared/model/basic.entity";
import { User } from "src/user/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { APIKeyStauts } from "./api.dto";

@Entity({ name: 'TB_API_KEY' })
export class APIKey extends BasicEntity {
    @Exclude()
    @Column({ type: 'text' })
    hashKey: string;

    @Column({ type: 'text' })
    maskKey: string;

    @Column({ length: 30, nullable: true })
    label: string;

    @Column({ type: 'enum', enum: APIKeyStauts, default: APIKeyStauts.ACTIVE })
    status: APIKeyStauts;

    @Column({ nullable: true })
    lastUsedAt: Date;

    @ManyToOne(() => User, entity => entity.apiKeys)
    @JoinColumn({ name: 'userId' })
    user: User;

    @OneToMany(() => APIFeatureUsage, entity => entity.apiKey)
    apiFeatureUsageList: APIFeatureUsage[];
}

@Entity({ name: 'TB_API_FEATURE_USAGE' })
export class APIFeatureUsage extends BasicEntity {
    @Column({ length: 50 })
    feature: string;

    @Column()
    usagePoint: number;

    @ManyToOne(() => User, entity => entity.apiKeys)
    @JoinColumn({ name: 'apiKeyId' })
    apiKey: APIKey;
} 