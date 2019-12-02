import { ObjectType, InputType } from 'type-graphql';
import { SkiperTravelsDto } from '../skiper-travels/skiper-travels.dto';
import { SkiperUserInvoiceDto } from '../skiper-user-invoice/skiper-user-invoice.dto';

@InputType()
export class SkiperInvoiceDetailInput {
    id: number;
    iduserinvoice: number;
    idanyservice: number;
    total: number;
}

@ObjectType()
export class SkiperInvoiceDetailDto {
    id: number;
    invoice: SkiperUserInvoiceDto;
    anyservice: SkiperTravelsDto;
    total: number;
}