import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CountryPaymentCurrency } from '../country-payment-currency/country-payment-currency.entity';
import { ExchangeRate } from '../exchange-rate/exchange-rate.entity';

@Entity('currency')
export class Currency {
    @PrimaryGeneratedColumn() id: number;
    @Column('varchar', { length: 30, nullable: false }) name: string;
    @Column('int', { nullable: false }) idcountry: number;
    @Column('boolean') isCrypto: boolean;
    @Column('text') iso: string;
    @Column('longtext') url_img: string;

    @OneToMany(type => ExchangeRate, exchangerate => exchangerate.currency) exchangerate: ExchangeRate[];
    @OneToMany(type => CountryPaymentCurrency, x => x.currency) countrypaymentcurrency: CountryPaymentCurrency[];
}