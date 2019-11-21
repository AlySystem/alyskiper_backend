import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { SkiperOrderTracingService } from './skiper-order-tracing.service';
import { SkiperOrderTracingInput } from './skiper-order-tracing.dto';
import { PubSub } from 'graphql-subscriptions';
import { SkiperOrderService } from '../skiper-order/skiper-order.service';
import { SkiperOrder } from '../skiper-order/skiper-order.entity';

const pubSub = new PubSub();

@Resolver('SkiperOrderTracing')
export class SkiperOrderTracingResolver {

    constructor(
        private readonly service:SkiperOrderTracingService,
        private readonly f: SkiperOrderService){}

    @Query()
    getAllOrderTracing(){
        return this.service.getAll();
    }

    public NotificarCambiosEnPedido(pedido){
        pubSub.publish('skiperOrders', { skiperOrders: pedido, idcomercio: pedido.skiperCommerce.id });
    }

    @Mutation()
    async registerOrderTracing(@Args('input') input: SkiperOrderTracingInput){
        let result = await this.service.create(input);
        let pedido = await this.f.GetOrderByID(result.idorder)
        this.NotificarCambiosEnPedido(pedido)
        return result
    }

    @Subscription('skiperOrders',  {
        filter(payload, variables) {
            return payload.idcomercio === variables.idcomercio
        }
    })
    skiperOrders() {
        return pubSub.asyncIterator('skiperOrders')
    }
}