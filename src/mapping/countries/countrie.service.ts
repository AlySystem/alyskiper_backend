import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Countrie } from './countrie.entity';
import { Repository, createQueryBuilder, getConnection } from 'typeorm';
import { countrieInput } from './countrie.dto';

@Injectable()
export class CountrieService {

    constructor(@InjectRepository(Countrie) private countrieRepository: Repository<Countrie>) { }

    //Obtener unicamente los nombres y los codigos de telefono de los paisesdddd
    async getAllCountries(): Promise<Countrie[]> {
        return await this.countrieRepository.find();
    }

    async getAllCitiesByCountryId(id: number) {
        return await this.countrieRepository.find({
            relations: ["cities"],
            where: { id }
        })
    }

    async getById(id: number) {
        return await this.countrieRepository.findOne({
            where: { id: id }
        })
    }

    async getCountrieByName(name: string) {
        try {
            return await getConnection().createQueryBuilder(Countrie, "Countrie")
                .where("Countrie.name = :name", { name: name.toUpperCase() }).getOne();
        } catch (error) {
            throw new HttpException(
                "Error get country" + error,
                HttpStatus.BAD_REQUEST
            )
        }
    }    

    async showAll(page: number = 1): Promise<Countrie[]> {
        const countries = await this.countrieRepository.find({
            take: 25,
            skip: 25 * (page - 1),
            order: { id: 'ASC' }
        });
        return countries;
    }
    async create(input: countrieInput): Promise<Countrie> {
        try {
            let countrieparse = this.parseCountries(input);
            return await this.countrieRepository.save(countrieparse);
        } catch (error) {
            throw new HttpException(
                error,
                HttpStatus.BAD_REQUEST
            );
        }

    }
    async update(input: countrieInput): Promise<Countrie> {
        let result = await this.getById(input.id);
        result.tax = input.tax;
        result.exchange = input.exchange;
        result.flag = input.flag;
        result.iso = input.iso;
        result.iso3 = input.iso3;
        result.name = input.name;
        result.nicename = input.nicename;
        result.numcode = input.numcode;
        result.phonecode = input.phonecode;
        result.url_flag = input.url_flag;
        return await this.countrieRepository.save(result);
    }

    private parseCountries(input: countrieInput): Countrie {
        let countrie: Countrie = new Countrie();
        countrie.tax = input.tax;
        countrie.exchange = input.exchange;
        countrie.flag = input.flag;
        countrie.iso = input.iso;
        countrie.iso3 = input.iso3;
        countrie.name = input.name;
        countrie.nicename = input.nicename;
        countrie.numcode = input.numcode;
        countrie.phonecode = input.phonecode;
        countrie.url_flag = input.url_flag;

        return countrie;
    }
}