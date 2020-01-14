import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { SkiperVehicleService } from './skiper-vehicle.service';
import { SkiperVehicleInput } from './skiper-vehicle.dto';
import { ParseIntPipe } from '@nestjs/common';

@Resolver('SkiperVehicle')
export class SkiperVehicleResolver {

    constructor(private readonly service: SkiperVehicleService) { }

    @Query('SkiperVehicle')
    async getAllSkiperVehicle() {
        return await this.service.getAll();
    }

    @Query()
    getSkiperVehicleByVehicleId(@Args('id', ParseIntPipe) id: number) {
        return this.service.getById(id);
    }

    @Query()
    getVehicleByUserId(@Args('id', ParseIntPipe) id: number) {
        return this.service.getVehicleByUserId(id);
    }

    @Query()
    getVehicleByNumberPlate(@Args('numberplate') numberplate: string) {
        return this.service.getVehicleByNumberPlate(numberplate);
    }

    @Query()
    getVehicleBySponsorIdAndCategoryTravelId(
        @Args('id_sponsor') id_sponsor: number,
        @Args('cat_travel_id') cat_travel_id: number
    ) {
        return this.service.getVehicleBySponsorIdAndCategoryTravelId(id_sponsor, cat_travel_id);
    }

    @Mutation()
    async registerSkiperVehicle(@Args('input') input: SkiperVehicleInput) {
        let result = await this.service.registerSkiperVehicle(input);
        return result
    }

    @Mutation()
    async updateSkiperVehicle(@Args('input') input: SkiperVehicleInput) {
        let result = await this.service.updateSkiperVehicle(input);
        return result
    }
    
    @Mutation()
    async updateSkiperVehicleCatTravel(@Args('idVehicle') idVehicle: number, @Args('idCatTravel') idCatTravel: number) {
        let result = await this.service.updateSkiperVehicleCatTravel(idVehicle, idCatTravel);
        return result
    }

}
