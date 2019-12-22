import { InputType, ObjectType } from 'type-graphql';

@InputType()
export class HashConfirmedInput {
    id: number;
    invoice: number;
    hash: string;
    date_in: Date;
}

@ObjectType()
export class HashConfimedDto{
    id: number;
    invoice: number;
    hash: string;
    date_in: Date;
}