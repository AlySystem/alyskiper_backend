import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SkiperCatTravelsInput } from './skiper-cat-travel.dto';
import { SkiperCatTravel } from './skiper-cat-travel.entity';

@Injectable()
export class SkiperCatTravelsService {
    constructor(
        @InjectRepository(SkiperCatTravel) private readonly repository: Repository<SkiperCatTravel>
    ) { }

    async getAll(): Promise<SkiperCatTravel[]> {
        try {
            return await this.repository.find();
        } catch (error) {
            console.error(error)
        }
    }

    async getById(id: number): Promise<SkiperCatTravel> {
        return await this.repository.findOne({
            where: { id }
        });
    }

    async update(input: SkiperCatTravelsInput): Promise<SkiperCatTravel> {
        //console.log(input);
        try {
            let skiperCatTravelUpdate = await this.getById(input.id);
            skiperCatTravelUpdate.name = input.name;
            skiperCatTravelUpdate.url_img_category = input.url_img_category;
            skiperCatTravelUpdate.mode_drive = input.mode_drive;
            skiperCatTravelUpdate.paycommission = input.paycommission;
            skiperCatTravelUpdate.percentageagent = input.percentageagent;
            //console.log(appUpdate);
            return await this.repository.save(skiperCatTravelUpdate);
        } catch (error) {
            console.log(error)
        }
    }

    async registerSkiperCatTravel(input: SkiperCatTravelsInput): Promise<SkiperCatTravel> {
        try {
            let skipercattravel = this.parseSkiperCatTravel(input);
            //console.log(skipercattravel);
            return this.repository.save(skipercattravel);
        } catch (error) {
            console.error(error)
        }
        return null;
    }

    private parseSkiperCatTravel(input: SkiperCatTravelsInput): SkiperCatTravel {
        let skipercattravel: SkiperCatTravel = new SkiperCatTravel();
        skipercattravel.name = input.name;
        skipercattravel.url_img_category = input.url_img_category;
        skipercattravel.url_img_drive = input.url_img_drive;
        skipercattravel.mode_drive = input.mode_drive;
        skipercattravel.paycommission = input.paycommission;
        skipercattravel.percentageagent = input.percentageagent;
        skipercattravel.urlImgName = input.urlImgName;
        return skipercattravel;
    }

}
