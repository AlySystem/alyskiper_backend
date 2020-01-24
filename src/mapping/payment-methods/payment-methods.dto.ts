import { InputType, ObjectType } from "type-graphql";
import {CurrencyDto} from "../currency/currency.dto";

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
    currency:CurrencyDto;
}

@ObjectType()
export class PaymentMethodsDto {
    cash: CashPaymentDto
    alypay: AlypayPaymentDto
}

@ObjectType()
export class CashPaymentDto {
    id: number;
    name: string;
    urlImg: string;
}

@ObjectType()
export class AlypayPaymentDto {
    id: number;
    name: string;
    urlImg: string;
}