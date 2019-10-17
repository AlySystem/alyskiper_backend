import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { SkiperOrderTracingService } from './skiper-order-tracing.service';
import { SkiperOrderTracingInput } from './skiper-order-tracing.dto';
import { SkiperOrderResolver } from '../skiper-order/skiper-order.resolver'

import { PubSub, withFilter } from 'graphql-subscriptions';
import { SkiperOrderService } from '../skiper-order/skiper-order.service';
import { SkiperOrder } from '../skiper-order/skiper-order.entity';
import { UseFilters, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { HttpExcepcionFilter } from '../../shared/http.exception.filter';

const pubSub = new PubSub();

@Resolver('SkiperOrderTracing')
export class SkiperOrderTracingResolver {

    constructor(private readonly service:SkiperOrderTracingService,
    private f: SkiperOrderService){}

    @Query()
    getAllOrderTracing(){
        return this.service.getAll();
    }

    @Mutation()
    async registerOrderTracing(@Args('input') input: SkiperOrderTracingInput){
        let result = await this.service.create(input);
        await this.f.getById(input.orderID).then( async (res: SkiperOrder) => {
            let n = [input.orderStatusID]
            let pedidos = await this.f.getByCommerceIdByIdStatus(res.skiperCommerce.id, n)
            pubSub.publish('getByCommerceIdByIdStatus', { getByCommerceIdByIdStatus: pedidos,
            Comercio: res.skiperCommerce.id })
            withFilter(()=> pubSub.asyncIterator("getByCommerceIdByIdStatus"), 
                (payload, variable) => {
                    return Boolean(
                        variable.Comercio == payload.Comercio
                    )
                }
            )
        })
        return result
    }

    @Subscription('getByCommerceIdByIdStatus')
    getByCommerceIdByIdStatus() {
        return pubSub.asyncIterator('getByCommerceIdByIdStatus')
    }
}