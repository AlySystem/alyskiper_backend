import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { SkiperProductCommerceService } from './skiper-product-commerce.service';
import { ParseIntPipe } from '@nestjs/common';
import { ProductCommerceInput } from './skiper-product-commerce.dto';

@Resolver('SkiperProductCommerce')
export class SkiperProductCommerceResolver {

    constructor(private readonly service: SkiperProductCommerceService) { }

    @Query()
    async productsCommerce() {
        return await this.service.getAll();
    }

    @Query()
    productsByCommerceId(@Args('id', ParseIntPipe) id: number) {
        console.log()
        return this.service.getAllByCommerceId(id);
    }

    @Query()
    async productsCommerceWithPagination(@Args('page', ParseIntPipe) page: number) {
        return await this.service.getAllByPagination(page);
    }

    @Query()
    async productsCommerceById(@Args('id', ParseIntPipe) id: number) {
        try {
            return await this.service.getById(id);
        } catch (error) {
            console.log(error)
        }
    }

    @Mutation()
    ChangeStateProducts(@Args('id', ParseIntPipe) id: number) {
        return this.service.changeState(id);
    }

    @Mutation()
    registerProductCommerce(@Args('input') input: ProductCommerceInput) {
        return this.service.registerProductCommerce(input);
    }

}
