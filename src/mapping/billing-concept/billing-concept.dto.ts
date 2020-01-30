import { InputType, ObjectType } from 'type-graphql';

@InputType()
export class BillingConceptInput {
    id: number;
    name: string;
}

@ObjectType()
export class BillingConceptDto {
    id: number;
    name: string;
}