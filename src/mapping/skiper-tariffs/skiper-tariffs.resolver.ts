import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { SkiperTariffsService } from './skiper-tariffs.service';
import { SkiperTariffsInput, SkiperTariffsFilterInput } from './skiper-tariffs.dto';

@Resolver('SkiperTariffs')
export class SkiperTariffsResolver {
    constructor(
        private readonly skiperTariffService: SkiperTariffsService
    ) { }

    @Query()
    async getAllTariffs() {
        return await this.skiperTariffService.getAll();
    }

    @Query()
    async getTariffsById(@Args('id') id: number) {
        return await this.skiperTariffService.findById(id);
    }

    @Query()
    async getTariffsByCountryId(@Args('idCountry') idCountry: number) {
        return await this.skiperTariffService.findByCountryId(idCountry);
    }

    @Query()
    async findTariffsWithFilters(
        @Args('filter') filter: SkiperTariffsFilterInput
    ) {
        console.log("Entro al Resolver")
        return await this.skiperTariffService.findWithFilters(filter.idCountry, filter.idCity, filter.idSchedule, filter.idCatTravel)
    }

    @Mutation()
    async insertTariff( @Args('input') input: SkiperTariffsInput){
        return await this.skiperTariffService.insert(input)
    }

    @Mutation()
    async updateTariff( @Args('input') input: SkiperTariffsInput){
        return await this.skiperTariffService.update(input)
    }

    @Mutation()
    async tariffBatchInsert( @Args('input') input: SkiperTariffsInput[]){
        return await this.skiperTariffService.batchInsert(input)
    }
}
