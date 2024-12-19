import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("coveragedisk")
export class CoveragediskEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    pid: string;

    @Column()
    projectID: string;

    @Column()
    reportID: string;

    @Column()
    sha: string;

    @Column()
    data: string;

    @Column()
    createdAt: Date;
}
