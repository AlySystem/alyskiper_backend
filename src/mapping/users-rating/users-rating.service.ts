import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRating } from './users-rating.entity';
import { Repository } from 'typeorm';
import { UsersRatingInput } from './users-rating.dto';

@Injectable()
export class UsersRatingService {
    constructor(
        @InjectRepository(UsersRating) private readonly repository: Repository<UsersRating>
    ) { }



    async getAll(): Promise<UsersRating[]> {
        return await this.repository.find({ relations: ["driver", "user"] });
    }

    async registerUsersRating(input: UsersRatingInput) {
        try {
            input.created = new Date();
            input.modified = new Date();
            let skiperRating = this.parseUserRating(input);
            let result = await this.repository.save(skiperRating);
            if (result) {
                return 'your rating has been received';
            } else {
                return 'transaction error';
            }
        } catch (error) {
            console.error(error);
        }
    }

    private parseUserRating(input: UsersRatingInput): UsersRating {
        let result: UsersRating = new UsersRating();

        result.idagent = input.idagent;
        result.iduser = input.iduser;
        result.ratingNumber = input.ratingNumber;
        result.status = input.status;
        result.comments = input.comments;
        result.created = input.created;
        result.modified = input.modified;

        return result;

    }
}
