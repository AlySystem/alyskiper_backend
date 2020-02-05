import { Resolver, Query, Args } from '@nestjs/graphql';
import { CurrencyService } from './currency.service';
import { ParseIntPipe } from '@nestjs/common';

@Resolver('Currency')
export class CurrencyResolver {
    constructor(
        private readonly currencyService: CurrencyService
    ) { }

    @Query('currency')
    async currency() {
        return this.currencyService.getAll();
    }
    @Query()
    async Cryptocurrency() {
        return this.currencyService.getAllCrypto();
    }
    @Query()
    async CryptocurrencyForTransfer() {
        return this.currencyService.getAllCryptoForTransfer();
    }
    @Query()
    async searchcurrency(@Args('id', ParseIntPipe) id: number) {
        return this.currencyService.getById(id);
    }
}
