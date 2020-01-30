import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PackageAlypayRecharge } from './package-alypay-recharge.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PackageAlypayRechargeService {
    constructor(
        @InjectRepository(PackageAlypayRecharge)
        private readonly repository: Repository<PackageAlypayRecharge>
    ) { }

    async getAll(): Promise<PackageAlypayRecharge[]> {        
        return await this.repository.find();
    }
}
