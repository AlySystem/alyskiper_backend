import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BillingConcept } from '../billing-concept/billing-concept.entity';
import { Currency } from '../currency/currency.entity';
import { AlycoinInvoices } from '../alycoin-invoices/alycoin-invoices.entity';


@Entity('detail_alycoin_invoice')
export class DetailAlycoinIinvoice {
    @PrimaryGeneratedColumn() id: number;
    @Column('int', { nullable: false }) idinvoice: number;
    @Column('int', { nullable: false }) billingConceptId: number;
    @Column('int', { nullable: false }) idpackage: number;
    @Column('double', { nullable: false }) total: number;
    @Column('double') amountCrypto: number;
    @Column('double') priceCryptoUSD: number;
    @Column('int') receivedCurrencyId: number;
    @Column('int') sendCurrencyId: number;
    @Column('text') walletAly: string;
    @Column('double') amountSendAlycoin: number;
    @Column('boolean') sent: boolean;
    @Column('datetime') dateIn: Date;

    @OneToOne(type => AlycoinInvoices, alycoinvoice => alycoinvoice)
    @JoinColumn({ name: "idinvoice" }) alycoinInvoices: AlycoinInvoices;


    @ManyToOne(type => Currency, { nullable: false })
    @JoinColumn({ name: 'sendCurrencyId' }) sendCurrency: Currency;

    @ManyToOne(type => Currency, { nullable: false })
    @JoinColumn({ name: 'receivedCurrencyId' }) receiveCurrency: Currency;

    @ManyToOne(type => BillingConcept, { nullable: false })
    @JoinColumn({ name: "billingConceptId" }) billingconcept: BillingConcept;
}