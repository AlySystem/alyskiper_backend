import { Module } from '@nestjs/common';
import { SkiperWalletsHistoryService } from './skiper-wallets-history.service';
import { SkiperWalletsHistoryResolver } from './skiper-wallets-history.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkiperWalletsHistory } from './skiper-wallets-history.entity';
import { SkiperWalletModule } from '../skiper-wallet/skiper-wallet.module';

@Module({
  imports: [
    SkiperWalletModule,
    TypeOrmModule.forFeature([SkiperWalletsHistory])
  ],
  providers: [SkiperWalletsHistoryService, SkiperWalletsHistoryResolver],
  exports: [SkiperWalletsHistoryService]
})
export class SkiperWalletsHistoryModule { }
