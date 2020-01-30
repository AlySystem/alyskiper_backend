import { Injectable } from '@nestjs/common';
import { AlycoinInvoices } from './alycoin-invoices.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlycoinInvoicesInput } from './alycoin-invoices.dto';

@Injectable()
export class AlycoinInvoicesService {
    constructor(
        @InjectRepository(AlycoinInvoices)
        private readonly repository: Repository<AlycoinInvoices>
    ) { }

    async getByNumFact(numFact: number): Promise<AlycoinInvoices> {
        return await this.repository.findOne({ where: { numfac: numFact } });
    }

    async update(input: AlycoinInvoicesInput): Promise<AlycoinInvoices> {
        let parseInput = await this.parseAlycoinInvoice(input);
        return await this.repository.save(parseInput);
    }

    private parseAlycoinInvoice(input: AlycoinInvoicesInput): AlycoinInvoices {
        let alycoininvoice: AlycoinInvoices = new AlycoinInvoices();
        alycoininvoice.id = input.id;
        alycoininvoice.numfac = input.numfac;
        alycoininvoice.iduser = input.iduser;
        alycoininvoice.idcountry = input.idcountry;
        alycoininvoice.state = input.state;
        return alycoininvoice;
    }
}
