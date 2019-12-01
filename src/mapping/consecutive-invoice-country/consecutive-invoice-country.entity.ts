import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Countrie } from '../countries/countrie.entity';


@Entity('consecutive_invoice_country')
export class ConsecutiveInvoiceCountry {
    @PrimaryGeneratedColumn() id: number;
    @Column('int', { nullable: false }) consecutive: number;
    @Column('int', { nullable: false }) idcountry: number;

    @ManyToOne(type => Countrie, { nullable: false })
    @JoinColumn({ name: 'idcountry' }) country: Countrie;
}