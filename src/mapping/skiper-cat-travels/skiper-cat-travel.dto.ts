import { InputType, ObjectType } from "type-graphql";

@InputType()
export class SkiperCatTravelsInput {
    id: number;
    name: string;
    url_img_category: string;
    url_img_drive: string;
    mode_drive: string;
    btaxy: boolean;
    bdelivery: boolean;
    btransporte: boolean;
    paycommission: number;
    percentageagent: number;
    urlImgName: string;
}

@ObjectType()
export class SkiperCatTravelDto {
    id: number;
    name: string;
    url_img_category: string;
    url_img_drive: string;
    mode_drive: string;
    paycommission: number;
    percentageagent: number;
    urlImgName: string;
}

@ObjectType()
export class SilverDto {
    id: number;
    name: string;
    url_img_category: string;
    urlImgName: string;
    total: number;
    currency: number;
    symbol: string;
}

@ObjectType()
export class GoldenDto {
    id: number;
    name: string;
    url_img_category: string;
    urlImgName: string;
    total: number;
    currency: number;
    symbol: string;
}
@ObjectType()
export class VipDto {
    id: number;
    name: string;
    url_img_category: string;
    urlImgName: string;
    total: number;
    currency: number;
    symbol: string;
}
@ObjectType()
export class PresidentDto {
    id: number;
    name: string;
    url_img_category: string;
    urlImgName: string;
    total: number;
    currency: number;
    symbol: string;
}
