import { Module } from '@nestjs/common';
import { PackageAlycoinResolver } from './package-alycoin.resolver';
import { PackageAlycoinService } from './package-alycoin.service';

@Module({
  providers: [PackageAlycoinResolver, PackageAlycoinService]
})
export class PackageAlycoinModule {}
