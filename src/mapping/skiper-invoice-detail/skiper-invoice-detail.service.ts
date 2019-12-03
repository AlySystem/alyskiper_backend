import { Injectable } from '@nestjs/common';
import { SkiperInvoiceDetail } from './skiper-invoice-detail.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryBuilder } from 'typeorm';

@Injectable()
export class SkiperInvoiceDetailService {
    constructor(
        @InjectRepository(SkiperInvoiceDetail)
        private readonly repository: Repository<SkiperInvoiceDetail>
    ) { }

    async getInvoiceByServiceId(idservice: number): Promise<SkiperInvoiceDetail> {
        try {
            let r = await this.repository.findOneOrFail(
                {
                    relations: ["anyservice", "invoice"],
                    where: { idanyservice: idservice }
                }
            )
            
            console.log(r);
            return r;

        } catch (error) {
            console.log(error)
        }
    }
}
