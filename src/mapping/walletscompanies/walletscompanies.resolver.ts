import { Resolver } from '@nestjs/graphql';
import { WalletscompaniesService } from './walletscompanies.service';

@Resolver('Walletscompanies')
export class WalletscompaniesResolver {
    constructor(
        private readonly service: WalletscompaniesService
    ) { }
}
