import { Injectable } from '@nestjs/common';
import { ExchangeRate } from './exchange-rate.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRateInput } from './exchange-rate.dto';
import { CountrieService } from '../countries/countrie.service';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class ExchangeRateService {
    constructor(
        @InjectRepository(ExchangeRate)
        private readonly repository: Repository<ExchangeRate>,
        private readonly countrieservice: CountrieService,
        private readonly CurrencyService: CurrencyService
    ) { }

    async getAll(): Promise<ExchangeRate[]> {
        try {
            return await this.repository.find({
                relations: ["country", "currency"]
            });
        } catch (error) {
            console.log(error)
        }
    }

    async getById(id: number) {
        return this.repository.findOne(id, {
            relations: ["country", "currency"]
        });
    }

    async create(input: ExchangeRateInput): Promise<ExchangeRate> {
        let country = await this.countrieservice.getById(input.countryid);
        let currency = await this.CurrencyService.getById(input.idcurrency);
        input.date_in = new Date();
        let exchangerateParse = this.parseExchangeRate(input, country, currency)
        return await this.repository.save(exchangerateParse);
    }

    async update(input: ExchangeRateInput): Promise<ExchangeRate> {
        let exchangerate = await this.getById(input.id);
        exchangerate.country = await this.countrieservice.getById(input.countryid);
        exchangerate.currency = await this.CurrencyService.getById(input.idcurrency);
        input.date_in = new Date();

        return await this.repository.save(exchangerate);
    }

    private parseExchangeRate(input: ExchangeRateInput, country?, currency?): ExchangeRate {
        let exchangerate: ExchangeRate = new ExchangeRate();
        exchangerate.country = country;
        exchangerate.date_in = input.date_in;
        exchangerate.currency = currency;
        exchangerate.value = input.value;
        return exchangerate;
    }

}
