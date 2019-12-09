import { Module } from '@nestjs/common';
import { DetailAlycoinInvoiceService } from './detail-alycoin-invoice.service';
import { DetailAlycoinInvoiceResolver } from './detail-alycoin-invoice.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetailAlycoinIinvoice } from './detail-alycoin-invoice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetailAlycoinIinvoice])
  ],
  providers: [DetailAlycoinInvoiceService, DetailAlycoinInvoiceResolver],
  exports: [DetailAlycoinInvoiceService]
})
export class DetailAlycoinInvoiceModule { }
