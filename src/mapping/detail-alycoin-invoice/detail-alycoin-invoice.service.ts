import { Injectable } from '@nestjs/common';
import { DetailAlycoinIinvoice } from './detail-alycoin-invoice.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, createQueryBuilder } from 'typeorm';
import { DetailAlycoinInvoiceInput } from '../detail-alycoin-invoice/detail-alycoin-invoice.dto';

@Injectable()
export class DetailAlycoinInvoiceService {
  constructor(
    @InjectRepository(DetailAlycoinIinvoice)
    private readonly service: Repository<DetailAlycoinIinvoice>
  ) { }

  async getById(id: number): Promise<DetailAlycoinIinvoice> {
    return await this.service.findOne(id);
  }

  async getDetailByNumfact(numFact: number, concept?) {
    if (concept == 1) {
      return await createQueryBuilder(DetailAlycoinIinvoice, "DetailAlycoinIinvoice")
        .innerJoinAndSelect("DetailAlycoinIinvoice.alycoinInvoices", "alycoinInvoices")
        .innerJoinAndSelect("DetailAlycoinIinvoice.receiveCurrency", "receiveCurrency")
        .innerJoinAndSelect("DetailAlycoinIinvoice.billingconcept", "billingconcept")
        .where("alycoinInvoices.numfac = :numfac", { numfac: numFact })
        .andWhere("alycoinInvoices.state = 0").getOne();
    }
    return await createQueryBuilder(DetailAlycoinIinvoice, "DetailAlycoinIinvoice")
      .innerJoinAndSelect("DetailAlycoinIinvoice.alycoinInvoices", "alycoinInvoices")
      .innerJoinAndSelect("DetailAlycoinIinvoice.receiveCurrency", "receiveCurrency")
      .innerJoinAndSelect("DetailAlycoinIinvoice.billingconcept", "billingconcept")
      .innerJoinAndSelect("DetailAlycoinIinvoice.sendCurrency", "sendCurrency")
      .where("alycoinInvoices.numfac = :numfac", { numfac: numFact })
      .andWhere("alycoinInvoices.state = 0").getOne();

  }

  async update(input: DetailAlycoinInvoiceInput): Promise<DetailAlycoinIinvoice> {
    let parseInput = await this.parseDetailAlycoinInvoice(input)
    console.log(parseInput)
    return await this.service.save(parseInput);
  }

  private parseDetailAlycoinInvoice(input: DetailAlycoinInvoiceInput): DetailAlycoinIinvoice {
    let detailalycoininvoice: DetailAlycoinIinvoice = new DetailAlycoinIinvoice();
    detailalycoininvoice.id = input.id;
    detailalycoininvoice.idinvoice = input.idinvoice
    detailalycoininvoice.billingConceptId = input.billingConceptId;
    detailalycoininvoice.walletAly = input.walletAly;
    detailalycoininvoice.idpackage = input.idpackage;
    detailalycoininvoice.amountCrypto = input.amountCrypto;
    detailalycoininvoice.priceCryptoUSD = input.priceCryptoUSD;
    detailalycoininvoice.receivedCurrencyId = input.receivedCurrencyId;
    detailalycoininvoice.sendCurrencyId = input.sendCurrencyId;
    detailalycoininvoice.amountSendAlycoin = input.amountSendAlycoin;
    detailalycoininvoice.sent = input.sent;
    detailalycoininvoice.total = input.total;
    detailalycoininvoice.dateIn = input.dateIn;
    return detailalycoininvoice;
  }
}
