import { Module } from '@nestjs/common';
import { BalanceAccumulatedDriverService } from './balance-accumulated-driver.service';
import { BalanceAccumulatedDriverResolver } from './balance-accumulated-driver.resolver';
import { balanceAccumulatedDriver } from './balance-accumulated-driver.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([balanceAccumulatedDriver])
  ],
  providers: [BalanceAccumulatedDriverService, BalanceAccumulatedDriverResolver],
  exports: [BalanceAccumulatedDriverService]
})
export class BalanceAccumulatedDriverModule { }
