import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SkiperRating } from './skiper-rating.entity';
import { Repository } from 'typeorm';
import { SkiperRatingInput } from './skiper-rating.dto';

@Injectable()
export class SkiperRatingService {
    constructor(
        @InjectRepository(SkiperRating) private readonly repository: Repository<SkiperRating>
    ) { }



    async getAll(): Promise<SkiperRating[]> {
        return await this.repository.find({ relations: ["driver", "user"] });
    }

    async registerSkiperRating(input: SkiperRatingInput): Promise<SkiperRating> {
        try {
            let skiperRating = this.parseSkiperRating(input);
            return await this.repository.save(skiperRating);;

        } catch (error) {
            console.error(error);
        }
    }

    private parseSkiperRating(input: SkiperRatingInput): SkiperRating {
        let result: SkiperRating = new SkiperRating();

        result.iddriver = input.iddriver;
        result.iduser = input.iduser;
        result.ratingNumber = input.ratingNumber;
        result.status = input.status;
        result.comments = input.comments;
        result.created = input.created;
        result.modified = input.modified;

        return result;

    }
}
