import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, createQueryBuilder } from 'typeorm';
import { CategoryAgent } from './categoty-agent.entity';

@Injectable()
export class CategoryAgentService {

    constructor(
        @InjectRepository(CategoryAgent) private readonly repository: Repository<CategoryAgent>
    ) { }

    async getAll(): Promise<CategoryAgent[]> {
        return await this.repository.find();
    }

    async getByCategoryAgentIdAndCityId(id: number, idcity: number) {
        try {
            let result = await createQueryBuilder("CategoryAgent")
                .innerJoinAndSelect("CategoryAgent.agents", "SkiperAgent")
                .innerJoinAndSelect("SkiperAgent.user", "User")
                .innerJoinAndSelect("User.city", "Cities")
                .where("CategoryAgent.id = :id", { id })
                .andWhere("User.idcity = :idcity", { idcity })
                .getMany();
            return result;
        } catch (error) {
            console.log(error)
        }
    }

    async getByCategoryAgentIdAndCountryId(id: number, idcountry: number) {
        try {
            let result = await createQueryBuilder("CategoryAgent")
                .innerJoinAndSelect("CategoryAgent.agents", "SkiperAgent")
                .innerJoinAndSelect("SkiperAgent.user", "User")
                .innerJoinAndSelect("User.country", "Countrie")
                .where("CategoryAgent.id = :id", { id })
                .andWhere("User.idcountry = :idcountry", { idcountry })
                .getMany();
            return result;
        } catch (error) {
            console.log(error)
        }
    }

    async getByCategoryAgentIdAndSponsorId(id: number, id_sponsor: number) {
        try {
            let result = await createQueryBuilder("CategoryAgent")
                .innerJoinAndSelect("CategoryAgent.agents", "SkiperAgent")
                .innerJoinAndSelect("SkiperAgent.user", "User")
                .where("CategoryAgent.id = :id", { id })
                .andWhere("User.sponsor_id = :id_sponsor", { id_sponsor })
                .getMany();
            return result;
        } catch (error) {
            console.log(error);
        }
    }

    async getById(id: number): Promise<CategoryAgent> {
        return await this.repository.findOne({ id });
    }
}
