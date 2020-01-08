import { Module } from '@nestjs/common';
import { ExchangeRateResolver } from './exchange-rate.resolver';
import { ExchangeRateService } from './exchange-rate.service';
import { ExchangeRate } from './exchange-rate.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountriesModule } from '../countries/countries.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [
    CountriesModule,
    CurrencyModule,
    TypeOrmModule.forFeature([ExchangeRate])
  ],
  providers: [ExchangeRateResolver, ExchangeRateService]
})
export class ExchangeRateModule { }
