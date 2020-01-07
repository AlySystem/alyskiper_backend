import { InputType, ObjectType } from "type-graphql";

@InputType()
export class CurrencyInput {
    id: number;
    name: string;
    idcountry: number;
    isCrypto: Boolean;
}

@ObjectType()
export class CurrencyDto {
    id: number;
    name: string;
    idcountry: number;
    isCrypto: Boolean;
}