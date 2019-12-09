import { Injectable } from '@nestjs/common';
import {DetailAlycoinIinvoice} from './detail-alycoin-invoice.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DetailAlycoinInvoiceService {
    constructor(
        @InjectRepository(DetailAlycoinIinvoice)
        private readonly service:Repository<DetailAlycoinIinvoice>
    ){}
}
