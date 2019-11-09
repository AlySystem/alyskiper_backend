import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { SkiperCommerceService } from './skiper-commerce.service';
import { CommerceInput } from './skiper-commerce.dto';
import { ParseIntPipe } from '@nestjs/common';

@Resolver('SkiperCommerce')
export class SkiperCommerceResolver {
    
    constructor(
        private readonly skiperCommerceService: SkiperCommerceService
    ){}

    @Query()
    async commerces() {
        return this.skiperCommerceService.getAll();
    }

    @Query()
    commerceById(@Args('id') id:number){
        return this.skiperCommerceService.getById(id);
    }

    @Query()
    async CommercesIntoRadio(
        @Args('latitud') latitud: number,
        @Args('longitud') longitud: number,
        @Args('radio') radio: number,
        @Args('id_category_product') id_category_product: number = 0) {
            // console.log(id_category_product);
        return this.skiperCommerceService.commerceIntoRadio(latitud, longitud, radio,id_category_product);
    }

    @Query()
    getUserWithoutCommerce(){
        return this.skiperCommerceService.getUserWithoutCommerce();
    }

    @Query()
    getCommercesBySponsorId(@Args('id_user')id_user: number,@Args('id_category_commerce') id_category_commerce: number){
        return this.skiperCommerceService.getCommercesBySponsorId(id_user,id_category_commerce);
    }

    @Mutation('registerCommerce')
    async registerCommerce(@Args('input') input: CommerceInput){
        return this.skiperCommerceService.registerCommerce(input);
    }
}
