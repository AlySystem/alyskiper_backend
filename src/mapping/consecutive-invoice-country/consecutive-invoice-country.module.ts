import { Module } from '@nestjs/common';
import { ConsecutiveInvoiceCountryResolver } from './consecutive-invoice-country.resolver';
import { ConsecutiveInvoiceCountryService } from './consecutive-invoice-country.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {ConsecutiveInvoiceCountry} from './consecutive-invoice-country.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([ConsecutiveInvoiceCountry])
  ],
  providers: [ConsecutiveInvoiceCountryResolver, ConsecutiveInvoiceCountryService],
  exports: [ConsecutiveInvoiceCountryService]
})
export class ConsecutiveInvoiceCountryModule {}
