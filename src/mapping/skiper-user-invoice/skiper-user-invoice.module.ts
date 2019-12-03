import { Module } from '@nestjs/common';
import { SkiperUserInvoiceService } from './skiper-user-invoice.service';
import { SkiperUserInvoiceResolver } from './skiper-user-invoice.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkiperUserInvoice } from './skiper-user-invoice.entity';
import { CountriesModule } from '../countries/countries.module';

@Module({
  imports: [
    CountriesModule,
    TypeOrmModule.forFeature([SkiperUserInvoice])
  ],
  providers: [SkiperUserInvoiceService, SkiperUserInvoiceResolver],
  exports: [SkiperUserInvoiceService]
})
export class SkiperUserInvoiceModule { }
