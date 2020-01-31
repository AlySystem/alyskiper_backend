import { ObjectType, InputType } from 'type-graphql';

@InputType()
export class DetailAlycoinInvoiceInput {
    id: number;
    idinvoice: number;
    billingConceptId: number;
    idpackage: number;
    total: number;
    amountCrypto: number;
    priceCryptoUSD: number;
    receivedCurrencyId: number;
    sendCurrencyId: number;
    walletAly: string;
    amountSendAlycoin
    sent: boolean;
    dateIn: Date;
}

@ObjectType()
export class DetailAlycoinInvoiceDto {
    id: number;
    idinvoice: number;
    billingConceptId: number;
    idpackage: number;
    total: number;
    amountCrypto: number;
    priceCryptoUSD: number;
    receivedCurrencyId: number;
    sendCurrencyId: number;
    walletAly: string;
    amountSendAlycoin
    sent: boolean;
    dateIn: Date;
}