import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Countrie } from '../countries/countrie.entity';
import { DetailAlycoinIinvoice } from '../detail-alycoin-invoice/detail-alycoin-invoice.entity';

@Entity('alycoin_invoices')
export class AlycoinInvoices {
    @PrimaryGeneratedColumn() id: number;
    @Column('int', { nullable: false }) numfac: number;
    @Column('int', { nullable: false }) iduser: number;
    @Column('int', { nullable: false }) idcountry: number;
    @Column('boolean') state: boolean;
    @Column('datetime', { nullable: false }) date_in: Date;

    @ManyToOne(type => User, { nullable: false })
    @JoinColumn({ name: 'iduser' }) user: User;
    @ManyToOne(type => Countrie, { nullable: false })
    @JoinColumn({ name: 'idcountry' }) country: Countrie;
    @OneToOne(type => DetailAlycoinIinvoice, detailInvoice => detailInvoice.alycoinInvoices) detailAlycoinInvoice: DetailAlycoinIinvoice;

}