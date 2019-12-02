import { Resolver, Args, Query } from '@nestjs/graphql';
import { SkiperInvoiceDetailService } from './skiper-invoice-detail.service';

@Resolver('SkiperInvoiceDetail')
export class SkiperInvoiceDetailResolver {
    constructor(private readonly service: SkiperInvoiceDetailService) { }

    @Query()
    async getInvoinceByIdservice(@Args('idservice') idservice: number) {
        return await this.service.getInvoiceByServiceId(idservice);
    }
}
