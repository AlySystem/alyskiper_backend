import { Resolver } from '@nestjs/graphql';
import { ExchangeRateService } from './exchange-rate.service';

@Resolver('ExchangeRate')
export class ExchangeRateResolver {
    constructor(
        private readonly exchangerate: ExchangeRateService
    ) { }
}
