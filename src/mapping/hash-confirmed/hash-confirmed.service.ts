import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HashConfirmed } from './hash-confirmed.entity';
import { Repository } from 'typeorm';
import { HashConfirmedInput } from './hash-confirmed.dto';

@Injectable()
export class HashConfirmedService {
    constructor(
        @InjectRepository(HashConfirmed)
        private readonly repository: Repository<HashConfirmed>
    ) { }

    async getByHash(hash: string): Promise<HashConfirmed> {
        return await this.repository.findOne({ where: { hash: hash } });
    }

    async regiterHash(input: HashConfirmedInput) {
        let parsedata = this.parseHasInput(input);
        return await this.repository.save(parsedata);
    }

    private  parseHasInput(input: HashConfirmedInput): HashConfirmed {
        let hashconfirmed: HashConfirmed = new HashConfirmed();
        hashconfirmed.id = input.id;
        hashconfirmed.invoiceId = input.invoiceId;
        hashconfirmed.urlCheck = input.urlCheck;
        hashconfirmed.hash = input.hash;
        hashconfirmed.date_in = new Date();
        return hashconfirmed;
    }
}
