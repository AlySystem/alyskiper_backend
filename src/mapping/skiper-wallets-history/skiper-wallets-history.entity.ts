import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { SkiperWallet } from '../skiper-wallet/skiper-wallet.entity';
import { Currency } from '../currency/currency.entity';
import { TransactionType } from '../transaction-type/transaction-type.entity';
import { PaymentMethods } from '../payment-methods/payment-methods.entity';

@Entity('skiper_wallets_history')
export class SkiperWalletsHistory {

    @PrimaryGeneratedColumn() id: number;

    @Column({ nullable: false }) idskiperwallet: number;

    @Column({ nullable: false }) idtransactiontype: number;

    @Column({ nullable: false }) idpayment_methods: number;

    @Column({ nullable: false }) idcurrency: number;

    @Column('double', { nullable: false }) amount: number;

    @Column('double') amount_crypto: number;

    @Column('longtext', { nullable: true }) description: string;

    @Column({ nullable: false }) date_in: Date

    @Column({ nullable: false }) typeUser: boolean;

    @Column({ nullable: true }) paidout: boolean;

    @ManyToOne(type => SkiperWallet, { nullable: false })
    @JoinColumn({ name: 'idskiperwallet' }) skiperwallet: SkiperWallet;

    @ManyToOne(type => TransactionType, { nullable: false })
    @JoinColumn({ name: 'idtransactiontype' }) transactiontype: TransactionType;

    @ManyToOne(type => PaymentMethods, { nullable: false })
    @JoinColumn({ name: 'idpayment_methods' }) paymentmethod: PaymentMethods;

    @ManyToOne(type => Currency, { nullable: false })
    @JoinColumn({ name: 'idcurrency' }) currency: Currency;
}