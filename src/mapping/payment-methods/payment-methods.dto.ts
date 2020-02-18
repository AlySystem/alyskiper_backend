import { InputType, ObjectType } from "type-graphql";
import { CurrencyDto, CurrencyWhitWalletDto } from "../currency/currency.dto";
import { Bitcoin, LiteCoin, Dash, Alycoin, Ethereum } from "../skiper-wallet/skiper-wallet.dto";

@InputType()
export class PaymentMethodInput {
    id: number;
    name: string;
    pay_commissions: boolean;
    active: boolean;
    urlImg: string;
}

@ObjectType()
export class PaymentMethodDto {
    id: number;
    name: string;
    pay_commissions: boolean;
    active: boolean;
    urlImg: string;  
}

@ObjectType()
export class PaymentMethodsDto {
    cash: CashPaymentDto;
    alypay: AlypayPaymentDto;
}

@ObjectType()
export class CashPaymentDto {
    id: number;
    name: string;
    pay_commissions: boolean;
    active: boolean;
    urlImg: string;
    currency: CurrencyDto;
}

@ObjectType()
export class AlypayPaymentDto {
    id: number;
    name: string;
    pay_commissions: boolean;
    active: boolean;
    urlImg: string;
    bitcoin: Bitcoin;
    litecoin: LiteCoin;
    dash: Dash;
    alycoin: Alycoin;
    ethereum: Ethereum;
}