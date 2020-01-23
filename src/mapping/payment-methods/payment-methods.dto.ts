import { InputType, ObjectType } from "type-graphql";

@InputType()
export class PaymentMethodInput {
    id: number;
    name: string;
    pay_commissions: boolean;
    active: boolean;
    urlImg:string;
}

@ObjectType()
export class PaymentMethodDto {
    id: number;
    name: string;
    pay_commissions: boolean;
    active: boolean;
    urlImg:string;
}