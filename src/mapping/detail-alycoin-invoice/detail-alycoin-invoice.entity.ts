import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('detail_alycoin_invoice')
export class DetailAlycoinIinvoice {
    @PrimaryGeneratedColumn() id: number;
    @Column('int', { nullable: false }) idinvoice: number;
    @Column('int', { nullable: false }) idpackage: number;
    @Column('double', { nullable: false }) total: number;
}