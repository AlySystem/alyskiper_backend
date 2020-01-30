import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('hash_confirmed')
export class HashConfirmed {
    @PrimaryGeneratedColumn() id: number;
    @Column('int', { nullable: false }) invoiceId: number;
    @Column('text', { nullable: true }) urlCheck: string;
    @Column('text', { nullable: false }) hash: string;
    @Column('datetime', { nullable: false }) date_in: Date;
}