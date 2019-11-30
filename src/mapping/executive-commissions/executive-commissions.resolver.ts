import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { ExecutiveCommissionsService } from './executive-commissions.service';
import { ExecutiveCommissionsInput } from './executive-commissions.dto';

@Resolver('ExecutiveCommissions')
export class ExecutiveCommissionsResolver {
    constructor(
        private readonly executiveCommissionsService: ExecutiveCommissionsService
    ) { }

    @Mutation()
    async registerCommissions(@Args('input') input: ExecutiveCommissionsInput) {
        return await this.executiveCommissionsService.registerCommissions(input);
    }
}
