import { Exclude } from "class-transformer";
import { BaseEntity, BeforeUpdate, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export class BasicEntity extends BaseEntity {
    @Exclude()
    @PrimaryGeneratedColumn()
    id: number;

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