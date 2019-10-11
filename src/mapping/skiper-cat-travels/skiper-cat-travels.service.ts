import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SkiperCatTravelsInput} from './skiper-cat-travel.dto';
import { SkiperCatTravel } from './skiper-cat-travel.entity';

@Injectable()
export class SkiperCatTravelsService {
    constructor(
        @InjectRepository(SkiperCatTravel) private readonly repository:Repository<SkiperCatTravel>
    ){}

    async getAll():Promise<SkiperCatTravel[]>{
        try {
            return await this.repository.find();
        } catch (error) {
            console.error(error)
        }
    }

    async getById(id:number):Promise<SkiperCatTravel>{
        return await this.repository.findOne({
            where: {id}
        });
    }

    async update(input: SkiperCatTravelsInput): Promise<SkiperCatTravel>{
        //console.log(input);
        try {
            let skiperCatTravelUpdate = await this.getById(input.id);
            skiperCatTravelUpdate.name = input.name;
            skiperCatTravelUpdate.url_img_category = input.url_img_category;
            //console.log(appUpdate);
            return await this.repository.save(skiperCatTravelUpdate);
        } catch (error) {
            console.log(error)
        }
    }

    async registerSkiperCatTravel(input:SkiperCatTravelsInput):Promise<SkiperCatTravel>{
        try 
        {
            let skipercattravel = this.parseSkiperCatTravel(input);
            //console.log(skipercattravel);
            return this.repository.save(skipercattravel);
        } catch (error) {
            console.error(error)
        }
        return null;
    }

    private parseSkiperCatTravel(input:SkiperCatTravelsInput):SkiperCatTravel {
        let skipercattravel:SkiperCatTravel = new SkiperCatTravel();
        skipercattravel.name = input.name;
        skipercattravel.url_img_category = input.url_img_category;
        return skipercattravel;
    }

}
