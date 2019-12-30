import { ObjectType } from 'type-graphql';
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
}
