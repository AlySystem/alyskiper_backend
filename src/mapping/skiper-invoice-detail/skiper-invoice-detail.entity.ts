import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SkiperTravels } from '../skiper-travels/skiper-travels.entity';

@Entity('skiper_invoice_detail')
export class SkiperInvoiceDetail {
    @PrimaryGeneratedColumn() id: number;
    @Column('int', { nullable: false }) idanyservice: number;
    @Column('decimal', { nullable: false }) total: number;

    @ManyToOne(type => SkiperTravels, { nullable: false })
    @JoinColumn({ name: 'idanyservice' }) anyservice: SkiperTravels;
}