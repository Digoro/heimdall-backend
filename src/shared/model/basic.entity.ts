import { Expose } from "class-transformer";
import { BaseEntity, BeforeUpdate, CreateDateColumn, UpdateDateColumn } from "typeorm";

export class BasicEntity extends BaseEntity {
    @Expose()
    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updatedAt: Date;

    @BeforeUpdate()
    updateTimestamp() {
        this.updatedAt = new Date;
    }
}

export interface Dto<T> {
    toEntity(...args: any[]): T;
}