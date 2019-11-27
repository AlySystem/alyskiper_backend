import { InputType, ObjectType } from "type-graphql";
import { CommerceDto } from "../skiper-commerce/skiper-commerce.dto";
import { SkiperProductCommerceDto } from '../skiper-product-commerce/skiper-product-commerce.dto';

@InputType()
export class SkiperCatProductInput {
    id: number;
    name: string;
    description: string;
    url_img_product: string;
    skiperCommerceID: number;
}

@ObjectType()
export class SkiperCatProductDto {
    id: number;
    name: string;
    description: string;
    url_img_product: string;
    skiperCommerce: CommerceDto;
    skiperProductCommerce: SkiperProductCommerceDto;
}