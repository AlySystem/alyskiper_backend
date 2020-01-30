import { Module } from '@nestjs/common';
import { PackageAlycoinResolver } from './package-alypay-recharge.resolver';
import { PackageAlypayRechargeService } from './package-alypay-recharge.service';
import { PackageAlypayRecharge } from './package-alypay-recharge.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([PackageAlypayRecharge])
  ],
  providers: [PackageAlycoinResolver, PackageAlypayRechargeService],
  exports: [PackageAlypayRechargeService]
})
export class PackageAlypayRechargeModule { }
