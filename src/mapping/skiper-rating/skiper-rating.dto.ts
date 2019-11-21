import { InputType, ObjectType } from "type-graphql";
import { UserDto } from '../users/user.dto';
import { SkiperAgentDto } from '../skiper-agent/skiper-agent.dto';

@InputType()
export class SkiperRatingInput {
    id: number;
    iddriver: number;
    iduser: number;
    ratingNumber: number;
    comments: string;
    created: Date;
    modified: Date;
    status: boolean;
}

@ObjectType()
export class SkiperRatingDto {
    id: number;
    ratingNumber: number;
    comments: string;
    created: Date;
    modified: Date;
    status: boolean;
    driver: SkiperAgentDto[];
    user: UserDto[];
}