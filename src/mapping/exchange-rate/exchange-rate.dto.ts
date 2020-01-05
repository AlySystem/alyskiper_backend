import { InputType, ObjectType } from 'type-graphql';
import { countrieDto } from '../countries/countrie.dto';

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
    idcurrency: number;
    value: number;
    date_in: Date;
    country: countrieDto;
}