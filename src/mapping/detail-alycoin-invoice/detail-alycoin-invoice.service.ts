import { Injectable } from '@nestjs/common';
import { DetailAlycoinIinvoice } from './detail-alycoin-invoice.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, createQueryBuilder } from 'typeorm';

@Injectable()
export class DetailAlycoinInvoiceService {
  constructor(
    @InjectRepository(DetailAlycoinIinvoice)
    private readonly service: Repository<DetailAlycoinIinvoice>
  ) { }

  async getDetailByNumfact(numFact: number) {
    // return this.service.findOne({ relations: ["receiveCurrency", "billingconcept", "sendCurrency"], where: { idinvoice: numFact } })
    return await createQueryBuilder(DetailAlycoinIinvoice, "DetailAlycoinIinvoice")
      .innerJoinAndSelect("DetailAlycoinIinvoice.alycoinInvoices", "alycoinInvoices")
      .innerJoinAndSelect("DetailAlycoinIinvoice.receiveCurrency", "receiveCurrency")
      .innerJoinAndSelect("DetailAlycoinIinvoice.billingconcept", "billingconcept")
      .innerJoinAndSelect("DetailAlycoinIinvoice.sendCurrency", "sendCurrency")
      .where("alycoinInvoices.numfac = :numfac", { numfac: numFact })
      .andWhere("alycoinInvoices.state = 0").getOne();
  }
}
