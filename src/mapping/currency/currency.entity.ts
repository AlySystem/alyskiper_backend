import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CountryPaymentCurrency } from '../country-payment-currency/country-payment-currency.entity';

@Entity('currency')
export class Currency {
    @PrimaryGeneratedColumn() id: number;
    @Column('varchar', { length: 30, nullable: false }) name: string;
    @Column('int', { nullable: false }) idcountry: number;
    @Column('boolean') isCrypto: boolean;

    @OneToMany(type => CountryPaymentCurrency, x => x.currency) countrypaymentcurrency: CountryPaymentCurrency[];
}