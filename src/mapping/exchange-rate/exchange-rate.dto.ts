import { InputType, ObjectType } from 'type-graphql';
import { countrieDto } from '../countries/countrie.dto';
import { CurrencyDto } from '../currency/currency.dto';

@InputType()
export class ExchangeRateInput {
    id: number;
    countryid: number;
    idcurrency: number;
    value: number;
    date_in: Date;
}

@ObjectType()
export class ExchangeRateDto {
    id: number;
    value: number;
    date_in: Date;
    currency: CurrencyDto;
    country: countrieDto;
}