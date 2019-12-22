import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UsersRatingService } from './users-rating.service';
import { UsersRatingInput } from './users-rating.dto';


@Resolver('UsersRating')
export class UsersRatingResolver {
    constructor(private readonly service: UsersRatingService) { }

    @Query('UsersRating')
    async UsersRating() {
        return await this.service.getAll();
    }

    @Mutation()
    async RegisterUsersRating(@Args('input') input: UsersRatingInput) {
        return await this.service.registerUsersRating(input);
    }
}
