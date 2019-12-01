import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkiperUserInvoice } from './skiper-user-invoice.entity';

@Injectable()
export class SkiperUserInvoiceService {
    constructor(
        @InjectRepository(SkiperUserInvoice) private readonly repository: Repository<SkiperUserInvoice>
    ) { }
}
