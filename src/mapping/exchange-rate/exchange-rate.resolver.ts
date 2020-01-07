import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { ExchangeRateService } from './exchange-rate.service';
import { ExchangeRateInput } from './exchange-rate.dto';
@Resolver('ExchangeRate')
export class ExchangeRateResolver {
    constructor(
        private readonly exchangerate: ExchangeRateService
    ) { }

    @Query('GetAllExchangeRate')
    async GetAllExchangeRate() {
        return await this.exchangerate.getAll();
    }

    @Query()
    async GetByIdExchangeRate(@Args('id') id: number) {
        return await this.exchangerate.getById(id);
    }

    @Mutation()
    async registerExchangeRate(@Args('input') input: ExchangeRateInput) {
        return await this.exchangerate.create(input);
    }
    @Mutation()
    async updateExchangeRate(@Args('input') input: ExchangeRateInput) {
        return await this.exchangerate.update(input);
    }
}
