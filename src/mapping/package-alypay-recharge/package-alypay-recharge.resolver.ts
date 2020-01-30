import { Resolver, Query } from '@nestjs/graphql';
import { PackageAlypayRechargeService } from './package-alypay-recharge.service';

@Resolver('PackageAlycoin')
export class PackageAlycoinResolver {
    constructor(
        private readonly service: PackageAlypayRechargeService
    ) { }

    @Query('GetRechargePackage')
    async GetRechargePackage() {
        return this.service.getAll();
    }
}
