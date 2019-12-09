import { Resolver, Query } from '@nestjs/graphql';
import { PackageAlycoinService } from './package-alycoin.service';

@Resolver('PackageAlycoin')
export class PackageAlycoinResolver {
    constructor(
        private readonly service: PackageAlycoinService
    ) { }

    @Query('GetPackages')
    async GetPackages() {
        return this.service.getAll();
    }
}
