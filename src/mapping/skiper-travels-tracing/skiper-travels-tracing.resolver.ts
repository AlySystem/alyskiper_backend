import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { SkiperTravelsTracingService } from './skiper-travels-tracing.service';
import { SkiperTravelsTracingInput } from './skiper-travels-tracing.dto';
import { PubSub } from 'graphql-subscriptions';
import { SkiperTravelsService } from '../skiper-travels/skiper-travels.service';

const pubSub = new PubSub();

@Resolver('SkiperTravelsTracing')
export class SkiperTravelsTracingResolver {
    constructor(private readonly service: SkiperTravelsTracingService,
        private readonly f: SkiperTravelsService) { }

    @Query('skipertravelstracing')
    async skipertravelstracing() {
        return this.service.getAll();
    }

    public async NotificarCambiosEnViaje(travel, idusuario) {
        pubSub.publish('skiperTravel', { skiperTravel: travel, idusuario: idusuario })
    }

    @Mutation()
    async registerTravelsTracing(@Args('input') input: SkiperTravelsTracingInput) {
        var x = await this.service.registerTravelsTracing(input)
        var viaje = await this.f.GetTravelByID(x.idtravel)
        await this.NotificarCambiosEnViaje(viaje, viaje.skiperagent.id)
        await this.NotificarCambiosEnViaje(viaje, viaje.idusers)
        return x;
    }

    @Subscription('skiperTravel', {
        filter(payload, variables) {
            return payload.idusuario === variables.idusuario
        }
    })
    skiperTravel() {
        return pubSub.asyncIterator('skiperTravel')
    }
}
