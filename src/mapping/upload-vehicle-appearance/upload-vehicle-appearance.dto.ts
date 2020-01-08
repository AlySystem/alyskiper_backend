import { ObjectType, InputType } from 'type-graphql';
import { SkiperVehicleDto } from '../skiper-vehicle/skiper-vehicle.dto';
@ObjectType()
export class UploadVehicleAppearanceDto {
    id: number;
    url_img_vehicle_front: string;
    url_img_vehicle_behind: string;
    url_img_vehicle_side_right: string;
    url_img_vehicle_side_left: string;
    url_img_vehicle_inside_one: string;
    url_img_vehicle_inside_two: string;
    url_img_vehicle_inside_three: string;
    url_img_vehicle_inside_four: string;
    idvehicle: number;
    skiperVehicle: SkiperVehicleDto;
}
@InputType()
export class UploadVehicleAppearanceInput {
    id: number;
    url_img_vehicle_front: string;
    url_img_vehicle_behind: string;
    url_img_vehicle_side_right: string;
    url_img_vehicle_side_left: string;
    url_img_vehicle_inside_one: string;
    url_img_vehicle_inside_two: string;
    url_img_vehicle_inside_three: string;
    url_img_vehicle_inside_four: string;
    idvehicle: number;
}
