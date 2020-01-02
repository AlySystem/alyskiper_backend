import { Resolver, Query, Args } from '@nestjs/graphql';
import { CategoryAgentService } from './category-agent.service';
import { AuthGuard } from '../../shared/auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver('CategoryAgent')
export class CategoryAgentResolver {

    constructor(private categoryServices: CategoryAgentService){}

    @Query()
    async categoriesAgents(){
        return await this.categoryServices.getAll();
    }

    @UseGuards(new AuthGuard())
    @Query()
    getByCategoryAgentIdAndCityId(@Args('id')id:number,@Args('idcity')idcity:number){
        return this.categoryServices.getByCategoryAgentIdAndCityId(id,idcity);
    }

    @UseGuards(new AuthGuard())
    @Query()
    getByCategoryAgentIdAndCountryId(@Args('id')id:number,@Args('idcountry')idcountry:number){
        return this.categoryServices.getByCategoryAgentIdAndCountryId(id,idcountry);
    }

    @UseGuards(new AuthGuard())
    @Query()
    getByCategoryAgentIdAndSponsorId(@Args('id') id:number,@Args('id_sponsor') id_sponsor:number){
        console.log('entre aqui');
        return this.categoryServices.getByCategoryAgentIdAndSponsorId(id,id_sponsor);
    }
}