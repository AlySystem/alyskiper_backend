import { Injectable } from '@nestjs/common';
import { Currency } from './currency.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CurrencyInput } from './currency.dto';

@Injectable()
export class CurrencyService {
    constructor(
        @InjectRepository(Currency) private readonly repository: Repository<Currency>
    ) { }

    async getAll(): Promise<Currency[]> {
        return await this.repository.find();
    }

    async getAllCrypto(): Promise<Currency[]> {
        return await this.repository.find({ relations: ['country'], where: { isCrypto: 1 } })
    }

    async getAllCryptoForTransfer(): Promise<Currency[]> {
        return await this.repository.createQueryBuilder("Currency")
            .where("Currency.isCrypto = 1")
            .andWhere("Currency.name <>'Alycoin'")
            .getMany();

    }

    async getById(id: number): Promise<Currency> {
        return await this.repository.findOneOrFail({ relations: ['country'], where: { id } });
    }

    async registerCurrency(input: CurrencyInput) {
        try {
            let result = this.parseCurrency(input);
            if (result) {
                return await this.repository.save(result);
            }
        } catch (error) {
            console.error(error);
        }
    }

    async updateCurrency(input: CurrencyInput) {
        try {
            let result = await this.getById(input.id);
            result.name = input.name;
            return await this.repository.save(result);
        } catch (error) {
            console.error(error);
        }
    }

    private parseCurrency(input: CurrencyInput): Currency {
        let currency: Currency = new Currency();
        currency.name = input.name;
        currency.url_img = input.url_img;
        return currency;
    }

}
