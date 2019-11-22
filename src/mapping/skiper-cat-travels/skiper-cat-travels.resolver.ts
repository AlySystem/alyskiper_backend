import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { SkiperCatTravelsService } from './skiper-cat-travels.service';
import { SkiperCatTravelsInput } from './skiper-cat-travel.dto';
import { ParseIntPipe } from '@nestjs/common';

@Resolver('SkiperCatTravels')
export class SkiperCatTravelsResolver {
    constructor(
        private readonly skiperCatTravelsService: SkiperCatTravelsService
    ) { }

    @Query('skipercattravels')
    async skipercattravels() {
        return this.skiperCatTravelsService.getAll();
    }

    @Query()
    searchSkiperCatTravel(@Args('id', ParseIntPipe) id: number) {
        return this.skiperCatTravelsService.getById(id);
    }

    @Mutation()
    async registerSkiperCatTravel(@Args('input') input: SkiperCatTravelsInput) {
        try {
            return this.skiperCatTravelsService.registerSkiperCatTravel(input);
        }
        catch (error) {
            console.error(error);
        }
    }

    @Mutation()
    async updateSkiperCatTravel(@Args('input') input: SkiperCatTravelsInput) {
        return await this.skiperCatTravelsService.update(input);
    }

}
