import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VehicleTrademarInput } from './vehicle-trademark.dto';
import { VehicleTrademark } from './vehicle-trademark.entity';

@Injectable()
export class VehicleTrademarksService {

    constructor(
        @InjectRepository(VehicleTrademark) private readonly repository: Repository<VehicleTrademark>
    ) { }

    async getAll() {
        return await this.repository.find();
    }

    async getById(id: number) {
        return await this.repository.findOneOrFail({ id });
    }

    async update(input: VehicleTrademarInput): Promise<VehicleTrademark> {
        //console.log(input);
        try {
            let vehicletrademarkUpdate = await this.getById(input.id);
            vehicletrademarkUpdate.name = input.name;
            //console.log(appUpdate);
            return await this.repository.save(vehicletrademarkUpdate);
        } catch (error) {
            console.log(error)
        }
    }


    async registerVehicleTrademark(input: VehicleTrademarInput): Promise<VehicleTrademark> {
        try {
            let vehicletrademark = this.parseVehicleTrademark(input);
            //console.log(app);
            return this.repository.save(vehicletrademark);
        } catch (error) {
            console.error(error)
        }
        return null;
    }

    private parseVehicleTrademark(input: VehicleTrademarInput): VehicleTrademark {
        let vehicletrademark: VehicleTrademark = new VehicleTrademark();
        vehicletrademark.name = input.name;
        return vehicletrademark;
    }
}
