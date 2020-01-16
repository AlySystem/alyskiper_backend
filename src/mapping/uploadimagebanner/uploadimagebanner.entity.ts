import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";


@Entity()
export class uploadimagebanner {

    @PrimaryGeneratedColumn() id: number;
    @Column("longtext", { nullable: true }) urlImageBanner: string;

}