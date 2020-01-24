import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, OneToOne, ManyToOne } from 'typeorm';
import { CountryPaymentCurrency } from '../country-payment-currency/country-payment-currency.entity';
import { ExchangeRate } from '../exchange-rate/exchange-rate.entity';
import { SkiperWallet } from '../skiper-wallet/skiper-wallet.entity';
import { Countrie } from '../countries/countrie.entity';
import { PaymentMethods } from '../payment-methods/payment-methods.entity';

@Entity('currency')
export class Currency {
    @PrimaryGeneratedColumn() id: number;
    @Column('varchar', { length: 30, nullable: false }) name: string;
    @Column('int', { nullable: false }) idcountry: number;
    @Column('boolean') isCrypto: boolean;
    @Column('text') iso: string;
    @Column('longtext') url_img: string;
    @Column('int') paymentMethodId: number;

    @OneToMany(type => SkiperWallet, skiperwallet => skiperwallet.currencyID) skiperwallet: SkiperWallet[];
    @OneToMany(type => ExchangeRate, exchangerate => exchangerate.currency) exchangerate: ExchangeRate[];
    @OneToMany(type => CountryPaymentCurrency, x => x.currency) countrypaymentcurrency: CountryPaymentCurrency[];
    @ManyToOne(type => Countrie)
    @JoinColumn({ name: 'idcountry' }) country: Countrie;
    @ManyToOne(type => PaymentMethods)
    paymentMethod: PaymentMethods;
}