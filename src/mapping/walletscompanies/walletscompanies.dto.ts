import { InputType, ObjectType } from 'type-graphql';

@InputType()
export class WalletsCompaniesInput {
    id: number;
    identifier: string;
    name_company: string;
    txt: string;
}

@ObjectType()
export class WalletsCompaniesDto {
    id: number;
    identifier: string;
    name_company: string;
    txt: string;
}
