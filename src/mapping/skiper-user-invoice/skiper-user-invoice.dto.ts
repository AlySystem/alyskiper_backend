import { InputType, ObjectType } from 'type-graphql';
import { countrieDto } from '../countries/countrie.dto';
import { SkiperAgentDto } from '../skiper-agent/skiper-agent.dto';

@InputType()
export class SkiperUserInvoiceInput {
    id: number;
    numfac: number;
    iduser: number;
    anyagent: number;
    idcountry: number;
    date_in: Date;
}

@ObjectType()
export class SkiperUserInvoiceDto {
    id: number;
    numfac: number;
    iduser: number;
    anyagent: SkiperAgentDto;
    country: countrieDto;
    date_in: Date;
}