import { ObjectType, InputType } from 'type-graphql';

@InputType()
export class AlycoinInvoicesInput {
    id: number;
    numfac: number;
    iduser: number;
    idcountry: number;
    state: boolean;
    date_in: Date;
}

@ObjectType()
export class AlycoinInvoicesDto {
    id: number;
    numfac: number;
    iduser: number;
    idcountry: number;
    state: boolean;
    date_in: Date;
}