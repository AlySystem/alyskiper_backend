import { Resolver } from '@nestjs/graphql';
import { ExecutiveCommissionsService } from './executive-commissions.service';

@Resolver('ExecutiveCommissions')
export class ExecutiveCommissionsResolver {
    constructor(
        private readonly executiveCommissionsService: ExecutiveCommissionsService
    ) { }
}
