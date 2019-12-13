import { Injectable } from '@nestjs/common';
import { Cities } from './cities.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountrieService } from '../countries/countrie.service';

@Injectable()
export class CitiesService {

    constructor(
        @InjectRepository(Cities) private readonly repository: Repository<Cities>,
        private readonly countryService: CountrieService
    ) { }

    async getAll(): Promise<Cities[]> {
        return await this.repository.find({ relations: ["country"] });
    }
    //prueba
    async getById(id: number): Promise<Cities> {
        return await this.repository.findOne({
            where: { id: id },
            relations: ["country"]
        })
    }

    async getCitiesByCountryId(idcountry: number): Promise<Cities[]> {
        let _country = await this.countryService.getById(idcountry);
        return await this.repository.find({
            relations: ["country"],
            where: { country: _country }
        })
    }
}
