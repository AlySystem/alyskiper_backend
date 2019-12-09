import { Resolver } from '@nestjs/graphql';
import { AlycoinInvoicesService } from './alycoin-invoices.service';

@Resolver('AlycoinInvoices')
export class AlycoinInvoicesResolver {
    constructor(
        private readonly service: AlycoinInvoicesService
    ) { }
}
