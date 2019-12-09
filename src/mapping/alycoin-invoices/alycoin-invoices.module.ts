import { Module } from '@nestjs/common';
import { AlycoinInvoicesResolver } from './alycoin-invoices.resolver';
import { AlycoinInvoicesService } from './alycoin-invoices.service';
import { AlycoinInvoices } from './alycoin-invoices.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    TypeOrmModule.forFeature([AlycoinInvoices])
  ],
  providers: [AlycoinInvoicesResolver, AlycoinInvoicesService],
  exports: [AlycoinInvoicesService]
})
export class AlycoinInvoicesModule { }
