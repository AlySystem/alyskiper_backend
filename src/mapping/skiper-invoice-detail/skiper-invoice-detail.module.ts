import { Module } from '@nestjs/common';
import { SkiperInvoiceDetailResolver } from './skiper-invoice-detail.resolver';
import { SkiperInvoiceDetailService } from './skiper-invoice-detail.service';
import { SkiperInvoiceDetail } from './skiper-invoice-detail.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([SkiperInvoiceDetail])
  ],
  providers: [SkiperInvoiceDetailResolver, SkiperInvoiceDetailService]
})
export class SkiperInvoiceDetailModule { }
