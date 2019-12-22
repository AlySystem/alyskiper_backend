import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HashConfirmed } from './hash-confirmed.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HashConfirmedService {
    constructor(
        @InjectRepository(HashConfirmed)
        private readonly repository: Repository<HashConfirmed>
    ) { }

    async getByHash(hash: string): Promise<HashConfirmed> {
        return await this.repository.findOne({ where: { hash: hash } });
    }
}
