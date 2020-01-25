import { Resolver, Query, Args } from '@nestjs/graphql';
import { PaymentMethodsService } from './payment-methods.service';
import { ParseIntPipe } from '@nestjs/common';

@Resolver('PaymentMethods')
export class PaymentMethodsResolver {
    constructor(private readonly paymentMethodService: PaymentMethodsService) { }

    @Query('PaymentMethod')
    async PaymentMethod() {
        return await this.paymentMethodService.getAll();
    }

    @Query('PaymentMethodActive')
    async PaymentMethodActive(@Args('total') total: number, @Args('userId') userId: number, @Args('lat') lat: number, @Args('long') long: number) {
        return await this.paymentMethodService.getActive(total, userId, lat, long);
    }

    @Query()
    async searchPaymentMethod(@Args('id', ParseIntPipe) id: number) {
        return await this.paymentMethodService.getById(id);
    }
}
