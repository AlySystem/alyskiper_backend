import { InputType, ObjectType } from "type-graphql";
import { CommerceDto } from "../skiper-commerce/skiper-commerce.dto";
import { SkiperCatProductDto } from "../skiper-cat-product-commerce/skiper-cat-product-commerce.dto";
import { OptionAddonDto } from "../option-addon/option-addon.dto";

@InputType()
export class ProductCommerceInput {
    id: number;
    name: string;
    description: string;
    url_img_product: string;
    price: number;
    isSize: boolean;
    state: boolean;
    isAddon: boolean;
    discount: number;
    skiperCommerceID: number;
    skiperCatProductsID: number;
}

@ObjectType()
export class SkiperProductCommerceDto {
    id: number;
    name: string;
    description: string;
    url_img_product: string;
    price: number;
    isSize: boolean;
    state: boolean;
    isAddon: boolean;
    discount: number;
    time: number;
    skiperCommerce: CommerceDto;
    skiperProducts: SkiperCatProductDto;
    optionAddon: OptionAddonDto;
}

@ObjectType()
export class ProductCommerceDto {
    id: number;
    name: string;
    description: string;
    url_img_product: string;
    price: number;
    isSize: boolean;
    state: boolean;
    isAddon: boolean;
    discount: number;
    time: number;
    skiperCommerce: CommerceDto;
    skiperProducts: SkiperCatProductDto;
    optionAddon: OptionAddonDto;
}

