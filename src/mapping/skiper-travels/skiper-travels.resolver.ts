import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { SkiperTravelsService } from './skiper-travels.service';
import { SkiperTravelsInput } from './skiper-travels.dto';
import { SkiperTravelsTracingResolver } from '../skiper-travels-tracing/skiper-travels-tracing.resolver';

@Resolver('SkiperTravels')
export class SkiperTravelsResolver {
    constructor(private readonly service: SkiperTravelsService,
        private readonly SkiperTravelsTracingResolver: SkiperTravelsTracingResolver) { }
    // por ahora esto nada mas
    @Query()
    async CalculateTariff(@Args('ip') ip: string,
        @Args('idcategoriaviaje') idcategoriaviaje: number,
        @Args('lat') lat: number,
        @Args('lng') lng: number) {
        return await this.service.CalcularTarifa(ip, idcategoriaviaje, lat, lng);
    }

    @Query()
    async getAllSkiperTravels() {
        return await this.service.getAll();
    }

    @Query()
    async getTravels(@Args('idagent') idagent: number) {
        return await this.service.GetTravels(idagent);
    }

    @Mutation()
    async GenerateTravel(@Args('inputviaje') inputviaje: SkiperTravelsInput, @Args('ip') ip: string) {
        var result = await this.service.GenerateTravel(inputviaje, ip);
        if (result != null) {
            let viaje = await this.service.GetTravelByID(result.id)
            await this.SkiperTravelsTracingResolver.NotificarCambiosEnViaje(viaje, viaje.skiperagent.id)
            await this.SkiperTravelsTracingResolver.NotificarCambiosEnViaje(viaje, viaje.idusers)
            return result
        }
        else
            return null
    }

    @Query()
    async getTravelByAgentId(@Args('idagent') idagent: number) {
        return await this.service.getTravelByAgentId(idagent);
    }


    @Query()
    async getTravelByUserId(@Args('iduser') iduser: number) {
        return await this.service.getTravelByUserId(iduser);
    }
}
