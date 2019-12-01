import { ObjectType, InputType } from 'type-graphql';
import { SkiperTravelsDto } from '../skiper-travels/skiper-travels.dto';

@InputType()
export class SkiperInvoiceDetailInput {
    id: number;
    idanyservice: number;
    total: number;
}

@ObjectType()
export class SkiperInvoiceDetailDto {
    id: number;
    anyservice: SkiperTravelsDto;
    total: number;
}