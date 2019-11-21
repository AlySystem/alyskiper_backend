import { Module } from '@nestjs/common';
import { PaymentCryptoCurrencyResolver } from './payment-crypto-currency.resolver';
import { PaymentCryptoCurrencyService } from './payment-crypto-currency.service';

@Module({
  providers: [PaymentCryptoCurrencyResolver, PaymentCryptoCurrencyService]
})
export class PaymentCryptoCurrencyModule {}
