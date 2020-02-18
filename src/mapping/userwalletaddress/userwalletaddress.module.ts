import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserwalletaddressService } from './userwalletaddress.service';
import { UserwalletaddressResolver } from './userwalletaddress.resolver';
import { UserWalletAddress } from './userwalletaddress.entity';
import { UsersModule } from '../users/users.module';
import { PaymentMethodsModule } from '../payment-methods/payment-methods.module';


@Module({
  imports: [
    UsersModule,
    PaymentMethodsModule,
    TypeOrmModule.forFeature([UserWalletAddress])
  ],
  providers: [UserwalletaddressService, UserwalletaddressResolver]
})
export class UserwalletaddressModule { }
