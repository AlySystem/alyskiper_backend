import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { CountrieService } from './countrie.service';
import { countrieDto, countrieInput } from './countrie.dto';

@Resolver('Countries')
export class CountriesResolver {

    constructor(private countrieService: CountrieService) { }

    @Query(() => [countrieDto])
    async countries() {
        return await this.countrieService.getAllCountries();
    }

    @Query()
    getAllCitiesByCountryId(@Args('id') id: number) {
        return this.countrieService.getAllCitiesByCountryId(id);
    }
    //CAMBIO ppppp
    @Query(() => countrieDto)
    async searchCountrie(@Args('id') id: number) {
        return await this.countrieService.getById(id);
    }

    @Query(() => [countrieDto])
    async showCountries(@Args('page') page: number) {
        return await this.countrieService.showAll(page);
    }

    @Mutation()
    async registerCountry(@Args('input') input: countrieInput) {
        return await this.countrieService.create(input);
    }

    @Mutation()
    async updateCountry(@Args('input') input: countrieInput) {
        return await this.countrieService.update(input);
    }

    // @Query(() => [countrieDto])
    // async searchCountries(@PaginationArgs() { page, limit }: PaginationArgs) {
    //     let page: number = parseInt(`${my_page}`);
    //     let limit: number = parseInt(`${mylimit}`);;
    //     limit = limit > 100 ? 100 : limit;
    //     return await this.countrieService.paginate({page, limit});
    // }
}
