import { Module } from '@nestjs/common';
import { PackageAlycoinResolver } from './package-alycoin.resolver';
import { PackageAlycoinService } from './package-alycoin.service';
import { PackageAlycoin } from './package-alycoin.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([PackageAlycoin])
  ],
  providers: [PackageAlycoinResolver, PackageAlycoinService],
  exports: [PackageAlycoinService]
})
export class PackageAlycoinModule { }
