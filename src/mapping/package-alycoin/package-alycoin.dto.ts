import { InputType, ObjectType } from 'type-graphql';


@InputType()
export class PackageAlycoinInput {
    id: number;
    name: string;
    price: number;
    img_url: string;
}

@ObjectType()
export class PackageAlycoinDto {
    id: number;
    name: string;
    price: number;
    img_url: string;
}