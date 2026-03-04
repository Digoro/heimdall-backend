import { BasicEntity } from "src/shared/model/basic.entity";
import { User } from "src/user/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { APIKeyStauts } from "./api.dto";

@Entity({ name: 'TB_API_KEY' })
export class APIKey extends BasicEntity {
    @Column({ type: 'text' })
    keyValue: string;

    @Column({ length: 30 })
    label: string;

    @Column({ type: 'enum', enum: APIKeyStauts, default: APIKeyStauts.ACTIVE })
    status: APIKeyStauts;

    @Column()
    expiresAt: Date;

    @Column()
    lastUsedAt: Date;

    @OneToMany(() => APIFeatureUsage, entity => entity.apiKey)
    apiFeatureUsageList: APIFeatureUsage[];
}

@Entity({ name: 'TB_API_FEATURE_USAGE' })
export class APIFeatureUsage extends BasicEntity {
    @Column({ length: 50 })
    feature: string;

    @Column()
    usagePoint: number;

    @ManyToOne(() => User, entity => entity.apiFeatureUsageList)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => User, entity => entity.apiFeatureUsageList)
    @JoinColumn({ name: 'apiKeyId' })
    apiKey: APIKey;
} 