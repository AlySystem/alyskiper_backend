import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserwalletaddressService } from './userwalletaddress.service';
import { UserwalletaddressResolver } from './userwalletaddress.resolver';
import { UserWalletAddress } from './userwalletaddress.entity';
import { UsersModule } from '../users/users.module';
import { PaymentMethodsModule } from '../payment-methods/payment-methods.module';
import { CurrencyModule } from '../currency/currency.module';


@Module({
  imports: [
    UsersModule,
    CurrencyModule,
    PaymentMethodsModule,
    TypeOrmModule.forFeature([UserWalletAddress])
  ],
  providers: [UserwalletaddressService, UserwalletaddressResolver]
})
export class UserwalletaddressModule { }
