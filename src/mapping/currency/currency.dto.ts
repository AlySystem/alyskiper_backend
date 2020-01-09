import { InputType, ObjectType } from "type-graphql";

@InputType()
export class CurrencyInput {
    id: number;
    name: string;
    idcountry: number;
    isCrypto: Boolean;
    iso: string;
    url_img: string;
}

@ObjectType()
export class CurrencyDto {
    id: number;
    name: string;
    idcountry: number;
    isCrypto: Boolean;
    iso: string;
    url_img: string;
}