import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from 'typeorm';
import { CountryPaymentCurrency } from '../country-payment-currency/country-payment-currency.entity';
import { Currency } from '../currency/currency.entity';

@Entity('payment_methods')
export class PaymentMethods {
    @PrimaryGeneratedColumn() id: number;

    @Column('varchar', { nullable: false, length: 30 }) name: string;

    @Column('boolean') pay_commissions: boolean;

    @Column('boolean') active: boolean;

    @Column('longtext') urlImg: string;

    @OneToMany(type => Currency, x => x.paymentMethod) currency: Currency[];

    @OneToMany(type => CountryPaymentCurrency, x => x.paymentmethod) countrypayment: CountryPaymentCurrency[];
}