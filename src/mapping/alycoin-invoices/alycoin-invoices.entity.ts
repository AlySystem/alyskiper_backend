import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Countrie } from '../countries/countrie.entity';

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

}