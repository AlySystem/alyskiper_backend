import { ObjectType, InputType } from "type-graphql";

@InputType()
export class countrieInput {
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
    url_flag: string;

}

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
    url_flag: string;
}