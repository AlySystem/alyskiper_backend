import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('hash_confirmed')
export class HashConfirmed {
    @PrimaryGeneratedColumn() id: number;

    @Column('int', { nullable: false }) invoice: number;
    @Column('text', { nullable: false }) hash: string;
    @Column('datetime', { nullable: false }) date_in: Date;
}