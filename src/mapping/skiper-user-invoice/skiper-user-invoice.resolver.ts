import { Resolver } from '@nestjs/graphql';
import { SkiperUserInvoiceService } from './skiper-user-invoice.service';

@Resolver('SkiperUserInvoice')
export class SkiperUserInvoiceResolver {
    constructor(
        private readonly skiperuserinvoiceservice: SkiperUserInvoiceService
    ) { }
}
