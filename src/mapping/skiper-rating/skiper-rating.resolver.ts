import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { SkiperRatingService } from './skiper-rating.service';
import { SkiperRatingInput } from './skiper-rating.dto';


@Resolver('SkiperRating')
export class SkiperRatingResolver {
    constructor(private readonly service: SkiperRatingService) { }

    @Query('skiperrating')
    async skiperrating() {
        return await this.service.getAll();
    }

    @Mutation()
    async RegisterSkiperRating(@Args('input') input: SkiperRatingInput) {
        console.log(input)
        return await this.service.registerSkiperRating(input);
    }
}
