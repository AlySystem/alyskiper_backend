import { InputType, ObjectType } from "type-graphql";
import { UserDto } from '../users/user.dto';
import { SkiperAgentDto } from '../skiper-agent/skiper-agent.dto';

@InputType()
export class UsersRatingInput {
    id: number;
    idagent: number;
    iduser: number;
    ratingNumber: number;
    comments: string;
    created: Date;
    modified: Date;
    status: boolean;
}

@ObjectType()
export class UsersRatingDto {
    id: number;
    ratingNumber: number;
    comments: string;
    created: Date;
    modified: Date;
    status: boolean;
    driver: SkiperAgentDto[];
    user: UserDto[];
}