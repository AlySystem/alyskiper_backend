import { ObjectType } from "type-graphql";

@ObjectType()
export class countrieDto {
    id: number;
    iso: string;
    name: string;
    nicename: string;
    iso3: string;
    numcode: number;
    phonecode: number;
    tax: number;
    exchange: number;
    flag: string;

}