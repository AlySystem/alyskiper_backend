import { Injectable } from '@nestjs/common';
import { UploadVehicleLegalDoc } from './upload-vehicle-legal-doc.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UploadVehicleLegalDocService {
    constructor(
        @InjectRepository(UploadVehicleLegalDoc) private repository: Repository<UploadVehicleLegalDocService>
    ) { }
    async getById(id: number){
        return await this.repository.findOne({
            where: { id: id },
            relations: ['skiperVehicle']
        });
    }
}
