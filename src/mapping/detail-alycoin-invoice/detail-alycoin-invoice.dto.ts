import { ObjectType, InputType } from 'type-graphql';

@InputType()
export class DetailAlycoinInvoiceInput {
    id: number;
    idinvoice: number;
    idpackage: number;
    total: number;
}

@ObjectType()
export class DetailAlycoinInvoiceDto {
    id: number;
    idinvoice: number;
    idpackage: number;
    total: number;
}