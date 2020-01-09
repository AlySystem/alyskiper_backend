import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UploadVehicleAppearance } from './upload-vehicle-appearance.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadVehicleAppearanceInput } from './upload-vehicle-appearance.dto';
import { SkiperVehicleService } from '../skiper-vehicle/skiper-vehicle.service';


@Injectable()
export class UploadVehicleAppearanceService {
    constructor(
        @InjectRepository(UploadVehicleAppearance)
        private readonly repository: Repository<UploadVehicleAppearance>,
        private readonly vehiclerepository: SkiperVehicleService
    ) { }

    async getAll() {
        try {
            return await this.repository.find(
                {
                    relations: ["skiperVehicle"]
                }
            );
        } catch (error) {
            console.log(error)
        }
    }

    async getById(id: number) {
        console.log(id)
        return await this.repository.findOne({ id }, { relations: ["skiperVehicle"] });
    }

    async create(input: UploadVehicleAppearanceInput): Promise<UploadVehicleAppearance> {
        try {
            let verificaVehicle = await this.vehiclerepository.getById(input.idvehicle);
            let parseuploadVehicleappearance = this.parseUploadVehicleAppearance(input, verificaVehicle);
            return await this.repository.save(parseuploadVehicleappearance);

        } catch (error) {
            throw new HttpException(
                `error transaction ${error}`,
                HttpStatus.BAD_REQUEST
            );
        }

    }

    async update(input: UploadVehicleAppearanceInput): Promise<UploadVehicleAppearance> {
        try {
            let result = await this.getById(input.id);
            let verificaVehicle = await this.vehiclerepository.getById(input.idvehicle);
            let parseuploadVehicleappearance = this.parseUploadVehicleAppearance(input, verificaVehicle);
            parseuploadVehicleappearance.id = result.id;
            return await this.repository.save(parseuploadVehicleappearance);

        } catch (error) {
            throw new HttpException(
                `error transaction ${error}`,
                HttpStatus.BAD_REQUEST
            );
        }

    }

    private parseUploadVehicleAppearance(input: UploadVehicleAppearanceInput, vehicle?): UploadVehicleAppearance {
        let uploadvehicleappearance: UploadVehicleAppearance = new UploadVehicleAppearance();
        uploadvehicleappearance.skiperVehicle = vehicle;
        uploadvehicleappearance.url_img_vehicle_behind = input.url_img_vehicle_behind;
        uploadvehicleappearance.url_img_vehicle_front = input.url_img_vehicle_front;
        uploadvehicleappearance.url_img_vehicle_inside_four = input.url_img_vehicle_inside_four;
        uploadvehicleappearance.url_img_vehicle_inside_one = input.url_img_vehicle_inside_one;
        uploadvehicleappearance.url_img_vehicle_inside_three = input.url_img_vehicle_inside_three;
        uploadvehicleappearance.url_img_vehicle_inside_two = input.url_img_vehicle_inside_two;
        uploadvehicleappearance.url_img_vehicle_side_left = input.url_img_vehicle_side_left;
        uploadvehicleappearance.url_img_vehicle_side_right = input.url_img_vehicle_side_right;
        return uploadvehicleappearance;
    }

}
