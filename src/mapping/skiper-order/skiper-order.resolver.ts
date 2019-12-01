import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { SkiperOrderService } from './skiper-order.service';
import { SkiperOrderInput } from './skiper-order.dto';
import { ParseIntPipe } from '@nestjs/common';
import { SkiperOrderDetailInput } from '../skiper-order-detail/skiper-order-detail.dto';
import { SkiperOrderTracingResolver } from '../skiper-order-tracing/skiper-order-tracing.resolver';

@Resolver('SkiperOrder')
export class SkiperOrderResolver {

    constructor(
        private readonly skiperOrderService: SkiperOrderService,
        private readonly skiperOrderTracingResolver: SkiperOrderTracingResolver
    ) { }

    @Query('skiperorders')
    async skiperorders() {
        return this.skiperOrderService.getAll();
    }

    @Query()
    async skiperNewOrders(@Args('idcommerce', ParseIntPipe) idcommerce: number) {
        let result = this.skiperOrderService.GetOrdenes(idcommerce, [1, 2]);
        return result;
    }

    @Query()
    async skiperOrdersInProcess(@Args('idcommerce', ParseIntPipe) idcommerce: number) {
        let result = this.skiperOrderService.GetOrdenes(idcommerce, [3, 4]);
        return result;
    }

    @Query()
    async skiperOrdersFinish(@Args('idcommerce', ParseIntPipe) idcommerce: number) {
        let result = this.skiperOrderService.GetOrdenes(idcommerce, [5, 6, 7]);
        return result;
    }

    @Query()
    async skiperCountNewOrders(@Args('idcommerce', ParseIntPipe) idcommerce: number) {
        let result = this.skiperOrderService.CountOrders(idcommerce, [1, 2]);
        return result;
    }

    @Query()
    async skiperCountOrdersInProces(@Args('idcommerce', ParseIntPipe) idcommerce: number) {
        let result = this.skiperOrderService.CountOrders(idcommerce, [3, 4]);
        return result;
    }

    @Query()
    searchSkiperOrder(@Args('id', ParseIntPipe) id: number) {
        return this.skiperOrderService.getById(id);
    }

    @Mutation('registerSkiperOrder')
    async registerSkiperOrder(@Args('input') input: SkiperOrderInput) {
        try {
            return this.skiperOrderService.registerSkiperOrder(input);
        } catch (error) {
            console.error(error);
        }
    }

    @Mutation()
    async GenereSkiperOrder(@Args('inputorder') inputorder: SkiperOrderInput,
        @Args('inputorderdetalle') inputorderdetalle: SkiperOrderDetailInput[]) {
        try {           
            var result = await this.skiperOrderService.GenereSkiperOrder(inputorder, inputorderdetalle);
            if (result != null) {
                let pedido = await this.skiperOrderService.GetOrderByID(result.id)
                this.skiperOrderTracingResolver.NotificarCambiosEnPedido(pedido)
                return result
            }
            else
                return null
        } catch (error) {
            console.error(error);
        }
    }

    @Mutation()
    async updateSkiperOrder(@Args('input') input: SkiperOrderInput) {
        return await this.skiperOrderService.update(input);
    }
}
