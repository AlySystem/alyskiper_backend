import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConsecutiveInvoiceCountry } from './consecutive-invoice-country.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ConsecutiveInvoiceCountryService {
    constructor(
        @InjectRepository(ConsecutiveInvoiceCountry)
        private readonly repository: Repository<ConsecutiveInvoiceCountry>
    ) { }
    
}
