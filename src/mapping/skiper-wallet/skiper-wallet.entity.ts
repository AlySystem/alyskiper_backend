import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert } from "typeorm";
import { User } from '../users/user.entity';
import { Currency } from '../currency/currency.entity';
import { Countrie } from '../countries/countrie.entity';

@Entity('skiper_wallet')
export class SkiperWallet {

    @PrimaryGeneratedColumn() id: number;

    @Column({ nullable: false }) iduser: number;

    @Column('double', { nullable: false }) amount: number;

    @Column('double') amount_crypto: number;

    @Column({ nullable: false }) idcurrency: number;

    @Column({ nullable: false }) idcountry: number;

    @Column('datetime', { nullable: false }) date_in: Date;

    @Column('float', { nullable: false }) minimun: number;

    @Column('boolean', { nullable: false }) bretirar: boolean;

    @ManyToOne(type => User, x => x.id)
    @JoinColumn({ name: 'iduser' }) userID: User;

    @ManyToOne(type => Currency, currency => currency.skiperwallet)
    @JoinColumn({ name: 'idcurrency' }) currencyID: Currency;

    @ManyToOne(type => Countrie, { nullable: false })
    @JoinColumn({ name: 'idcountry' }) countryID: Countrie;
}