import { Injectable } from '@nestjs/common';
import { AlycoinInvoices } from './alycoin-invoices.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AlycoinInvoicesService {
    constructor(
        @InjectRepository(AlycoinInvoices)
        private readonly repository: Repository<AlycoinInvoices>
    ) { }

    async createAlycoinInvoice(iduser: number, idcountry: number) {

    }
}
