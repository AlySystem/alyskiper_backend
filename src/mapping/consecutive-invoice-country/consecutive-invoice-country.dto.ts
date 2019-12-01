import { InputType, ObjectType } from 'type-graphql';
import { countrieDto } from '../countries/countrie.dto';

@InputType()
export class ConsecutiveInvoiceCountryInput {
    id: number;
    consecutive: number;
    idcountry: number;
}

@ObjectType()
export class ConsecutiveInvoiceCountryDto {
    id: number;
    consecutive: number;
    idcountry: countrieDto;
}