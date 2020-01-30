import { InputType, ObjectType } from 'type-graphql';


@InputType()
export class PackageAlypayRechargeInput {
    id: number;
    name: string;
    price: number;
    img_url: string;
}

@ObjectType()
export class PackageAlypayRechargeDto {
    id: number;
    name: string;
    price: number;
    img_url: string;
}