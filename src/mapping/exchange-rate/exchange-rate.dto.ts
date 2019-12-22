import { InputType, ObjectType } from 'type-graphql';

@InputType()
export class ExchangeRateInput {
    id: number;
    idcountry: number;
    idcurrency: number;
    value: number;
    date_in: Date;
}

@ObjectType()
export class ExchangeRateDto {
    id: number;
    idcountry: number;
    idcurrency: number;
    value: number;
    date_in: Date;
}