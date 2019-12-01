import { Resolver } from '@nestjs/graphql';
import { SkiperInvoiceDetailService } from './skiper-invoice-detail.service';

@Resolver('SkiperInvoiceDetail')
export class SkiperInvoiceDetailResolver {
    constructor(private readonly service: SkiperInvoiceDetailService) { }
}
