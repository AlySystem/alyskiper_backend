import { Resolver } from '@nestjs/graphql';
import { ConsecutiveInvoiceCountryService } from './consecutive-invoice-country.service';

@Resolver('ConsecutiveInvoiceCountry')
export class ConsecutiveInvoiceCountryResolver {
    constructor(
        private readonly consecutiveinvoicecountryservice: ConsecutiveInvoiceCountryService
    ) { }
}
