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

@ObjectType()
export class AllImagesDto {
    identity: string;
    iduser: number;
    url_img_commerceinside_four: string;
    url_img_commerceinside_one: string;
    url_img_commerceinside_three: string;
    url_img_commerceinside_two: string;
    url_img_commerceoutside_one: string;
    url_img_commerceoutside_two: string;
    url_img_driver_license: string;
    url_img_driving_record: string;
    url_img_identity: string;
    url_img_letterone_recomendation: string;
    url_img_lettertwo_recomendation: string;
    url_img_police_record: string;
    url_img_verify_identity: string;
    url_img_identification_ruc: string;
    url_img_power_letter_four: string;
    url_img_power_letter_one: string;
    url_img_power_letter_three: string;
    url_img_power_letter_two: string;
    url_img_trade_registration: string;
    idagent: number;
    idvehicle: number;
    url_img_vehicle_behind: string;
    url_img_vehicle_front: string;
    url_img_vehicle_inside_four: string;
    url_img_vehicle_inside_one: string;
    url_img_vehicle_inside_three: string;
    url_img_vehicle_inside_two: string;
    url_img_vehicle_side_left: string;
    url_img_vehicle_side_right: string;
    url_img_gas_emission: string;
    url_img_insurance: string;
    url_img_license_plate: string;
    url_img_mechanical_inspection: string;
    url_img_vehicle_circulation: string
}