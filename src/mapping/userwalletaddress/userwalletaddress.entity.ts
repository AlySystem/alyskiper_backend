import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from '../users/user.entity';
import { PaymentMethods } from '../payment-methods/payment-methods.entity';
import { Currency } from '../currency/currency.entity';

@Entity('userwalletaddress')
export class UserWalletAddress {
    @PrimaryGeneratedColumn() id: number;
    @Column('int', { nullable: false }) userId: number;
    @Column('int', { nullable: false }) currencyId: number;
    @Column('text') payaddress: string;
    @Column('text') platformName: string;
    @Column('int') paymentId: number;
    @Column('boolean') active: boolean;

    @ManyToOne(type => User, { nullable: false })
    @JoinColumn({ name: 'userId' }) user: User;
    @ManyToOne(type => PaymentMethods, { nullable: false })
    @JoinColumn({ name: 'paymentId' }) paymentMethod: Currency;
    @ManyToOne(type => Currency, { nullable: false })
    @JoinColumn({ name: 'currencyId' }) currency: Currency;
}