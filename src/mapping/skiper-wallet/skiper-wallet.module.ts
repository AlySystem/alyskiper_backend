import { Module } from '@nestjs/common';
import { SkiperWalletService } from './skiper-wallet.service';
import { SkiperWalletResolver } from './skiper-wallet.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkiperWallet } from './skiper-wallet.entity';
import { WalletscompaniesModule } from '../walletscompanies/walletscompanies.module';
import { UsersModule } from '../users/users.module';
import { HashConfirmedModule } from '../hash-confirmed/hash-confirmed.module';

@Module({
  imports: [
    HashConfirmedModule,
    WalletscompaniesModule,
    UsersModule,
    TypeOrmModule.forFeature([SkiperWallet])
  ],
  providers: [SkiperWalletService, SkiperWalletResolver],
  exports: [SkiperWalletService]
})
export class SkiperWalletModule { }
