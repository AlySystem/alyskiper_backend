import { Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkiperUserInvoice } from './skiper-user-invoice.entity';

@Injectable()
export class SkiperUserInvoiceService {
    constructor(
        @InjectRepository(SkiperUserInvoice) private readonly repository: Repository<SkiperUserInvoice>
    ) { }

    async getInvoiceByUserId(id: number): Promise<SkiperUserInvoice> {
        try {
            return await this.repository.findOneOrFail(
                {
                    relations: ["agent", "country", "invoices"],
                    where: { iduser: id },
                    order: { date_in: "DESC" }
                }
            )
        } catch (error) {
            console.log(error)
        }
    }
}
