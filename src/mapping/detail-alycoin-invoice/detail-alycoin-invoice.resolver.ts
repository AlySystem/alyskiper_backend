import { Resolver } from '@nestjs/graphql';
import { DetailAlycoinInvoiceService } from './detail-alycoin-invoice.service';

@Resolver('DetailAlycoinInvoice')
export class DetailAlycoinInvoiceResolver {
    constructor(
        private readonly service: DetailAlycoinInvoiceService
    ) { }
}
