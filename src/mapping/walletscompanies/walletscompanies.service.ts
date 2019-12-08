import { Injectable } from '@nestjs/common';
import { WalletsCompanies } from './walletscompanies.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class WalletscompaniesService {
    constructor(
        @InjectRepository(WalletsCompanies) private readonly repository: Repository<WalletsCompanies>
    ) { }

    async getWalletByCrypto(identifier: string): Promise<WalletsCompanies> {
        return await this.repository.findOneOrFail({
            where: { identifier }
        })
    }
}
