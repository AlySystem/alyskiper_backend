import { Module } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodsResolver } from './payment-methods.resolver';
import { PaymentMethods } from './payment-methods.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountriesModule } from '../countries/countries.module';
import { UsersModule } from '../users/users.module';
import { SkiperWalletModule } from '../skiper-wallet/skiper-wallet.module';

@Module({
  imports: [
    SkiperWalletModule,
    UsersModule,
    CountriesModule,
    TypeOrmModule.forFeature([PaymentMethods])
  ],
  providers: [PaymentMethodsService, PaymentMethodsResolver],
  exports: [PaymentMethodsService]
})
export class PaymentMethodsModule { }
