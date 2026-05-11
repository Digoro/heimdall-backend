import { Expose } from "class-transformer";
import { BaseEntity, BeforeUpdate, CreateDateColumn, UpdateDateColumn } from "typeorm";

export class BasicEntity extends BaseEntity {
    @Expose()
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @BeforeUpdate()
    updateTimestamp() {
        this.updatedAt = new Date;
    }
}

export interface Dto<T> {
    toEntity(...args: any[]): T;
}