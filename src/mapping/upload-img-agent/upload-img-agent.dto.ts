import { InputType, ObjectType } from "type-graphql";
import { SkiperAgentDto } from '../skiper-agent/skiper-agent.dto';

@InputType()
export class UploadImgAgentInput {
    id: number;
    id_skiper_agent: number;
    url_img_identity: string;
    url_img_verify_identity: string;
    url_img_letterone_recomendation: string;
    url_img_lettertwo_recomendation: string;
    url_img_driver_license: string;
    url_img_police_record: string;
    url_img_driving_record: string;
}

@ObjectType()
export class UploadImgAgentDto {
    id: number;
    id_skiper_agent: number;
    url_img_identity: string;
    url_img_verify_identity: string;
    url_img_letterone_recomendation: string;
    url_img_lettertwo_recomendation: string;
    url_img_driver_license: string;
    url_img_police_record: string;
    url_img_driving_record: string;
    skiperAgent: SkiperAgentDto;
}
