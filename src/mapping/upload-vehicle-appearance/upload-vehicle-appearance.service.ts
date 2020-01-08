import { Injectable } from '@nestjs/common';
import { UploadVehicleAppearance } from './upload-vehicle-appearance.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class UploadVehicleAppearanceService {
    constructor(
        @InjectRepository(UploadVehicleAppearance)
        private readonly repository: Repository<UploadVehicleAppearance>
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
}
