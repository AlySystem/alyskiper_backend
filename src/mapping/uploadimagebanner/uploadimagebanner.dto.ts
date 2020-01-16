import { ObjectType } from "type-graphql";

@ObjectType()
export class uploadimagebannerInput {
    id: number;
    urlImageBanner: string;
}

@ObjectType()
export class uploadimagebannerDto {
    id: number;
    urlImageBanner: string;
}