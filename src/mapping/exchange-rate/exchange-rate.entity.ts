import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Countrie } from '../countries/countrie.entity';
import { Currency } from '../currency/currency.entity';

@Entity('exchange_rate')
export class ExchangeRate {
    @PrimaryGeneratedColumn() id: number;
    @Column('double') value: number;
    @Column('date') date_in: Date;

    @ManyToOne(type => Countrie, country => country.exchangerate)
    country: Countrie;

    @ManyToOne(type => Currency, currency => currency.exchangerate)
    currency: Currency;
}