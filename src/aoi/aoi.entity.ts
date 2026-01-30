import { Imaging } from "src/imaging/imaging.entity";
import { BasicEntity } from "src/shared/model/basic.entity";
import { User } from "src/user/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";

@Entity({ name: 'aoi' })
export class AOI extends BasicEntity {
    @Column({ length: 50 })
    name: string;

    @Column({ type: 'jsonb' })
    cornerCoordinates: {
        topLeft: { x: number; y: number };
        topRight: { x: number; y: number };
        bottomLeft: { x: number; y: number };
        bottomRight: { x: number; y: number };
    };

    @ManyToOne(() => User, user => user.aois)
    @JoinColumn()
    user: User;

    @OneToMany(() => Imaging, imaging => imaging.aoi)
    imagings: Imaging[];
}