import { ObjectType, InputType } from "type-graphql";
import { SkiperSubCatCommerceDto } from '../skiper-sub-cat-commerces/skiper-sub-cat-commerces.dto';

@ObjectType()
export class SkiperCatCommerceDto {
    id: number
    name: string
    state: boolean
    url_img_category: string
    url_img_category_temp: string
    subcatcommerce: SkiperSubCatCommerceDto[]
}

@InputType()
export class CatCommerceInput {
    id: number
    name: string
    state: boolean
    url_img_category: string
    url_img_category_temp: string
}