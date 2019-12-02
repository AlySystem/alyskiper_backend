import { Resolver, Args, Query } from '@nestjs/graphql';
import { SkiperUserInvoiceService } from './skiper-user-invoice.service';
import { ParseIntPipe } from '@nestjs/common';

@Resolver('SkiperUserInvoice')
export class SkiperUserInvoiceResolver {
    constructor(
        private readonly skiperuserinvoiceservice: SkiperUserInvoiceService
    ) { }

    @Query()
    async getInvoinceByIdUser(@Args('iduser') iduser: number) {
        return await this.skiperuserinvoiceservice.getInvoiceByUserId(iduser)
    }
}
