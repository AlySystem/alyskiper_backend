import { Injectable } from '@nestjs/common';
import { SkiperInvoiceDetail } from './skiper-invoice-detail.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SkiperInvoiceDetailService {
    constructor(
        @InjectRepository(SkiperInvoiceDetail)
        private readonly repository: Repository<SkiperInvoiceDetail>
    ) { }
}
