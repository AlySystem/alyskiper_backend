import { InputType, ObjectType } from 'type-graphql';

@InputType()
export class HashConfirmedInput {
    id: number;
    invoiceId: number;
    urlCheck: string;
    hash: string;
    date_in: Date;
}

@ObjectType()
export class HashConfimedDto {
    id: number;
    invoiceId: number;
    urlCheck: string;
    hash: string;
    date_in: Date;
}