import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Cities } from "../cities/cities.entity";
import { CountryPaymentCurrency } from "../country-payment-currency/country-payment-currency.entity";
import { User } from '../users/user.entity';
import { SkiperUserInvoice } from '../skiper-user-invoice/skiper-user-invoice.entity';
import { ExchangeRate } from '../exchange-rate/exchange-rate.entity';
import { Currency } from '../currency/currency.entity';


@Entity('countries')
export class Countrie {

    @PrimaryGeneratedColumn() id: number;

    @Column({ length: 2, nullable: false }) iso: string;

    @Column({ length: 80, nullable: false }) name: string;

    @Column({ length: 80, nullable: false }) nicename: string;

    @Column({ length: 3, nullable: true }) iso3: string;

    @Column('longtext', { nullable: true }) flag: string;

    @Column('longtext', { nullable: false }) url_flag: string;

    @Column({ type: "smallint", nullable: true }) numcode: number;

    @Column({ type: "int", nullable: false }) phonecode: number;

    @Column({ type: "int", nullable: false }) tax: number;

    @Column('decimal', { nullable: false }) exchange: number;

    @OneToMany(type => Cities, x => x.country)
    cities: Cities[];

    @OneToMany(type => User, x => x.country)
    user: User[];

    @OneToMany(type => CountryPaymentCurrency, x => x.countrie)
    countrypaymentcurrency: CountryPaymentCurrency[];

    @OneToMany(type => SkiperUserInvoice, x => x.country)
    skiperuserinvoice: SkiperUserInvoice[];

    @OneToMany(type => Currency, x => x.idcountry)
    currency: Currency[];

    @OneToMany(type => ExchangeRate, exchangerate => exchangerate.country)
    exchangerate: ExchangeRate[];
}