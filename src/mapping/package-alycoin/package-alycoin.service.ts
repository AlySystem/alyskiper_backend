import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PackageAlycoin } from './package-alycoin.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PackageAlycoinService {
    constructor(
        @InjectRepository(PackageAlycoin)
        private readonly repository: Repository<PackageAlycoin>
    ) { }

    async getAll(): Promise<PackageAlycoin[]> {
        return await this.repository.find();
    }
    async getById(id: number): Promise<PackageAlycoin> {
        return await this.repository.findOne(id);
    }
}
