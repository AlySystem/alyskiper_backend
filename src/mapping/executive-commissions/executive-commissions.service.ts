import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExecutiveCommissions } from './executive-commissions.entity'
import { Repository } from 'typeorm';
import { ExecutiveCommissionsInput } from './executive-commissions.dto';

@Injectable()
export class ExecutiveCommissionsService {
    constructor(
        @InjectRepository(ExecutiveCommissions)
        private readonly repository: Repository<ExecutiveCommissions>
    ) { }

    async registerCommissions(input: ExecutiveCommissionsInput) {
        try {
            let inputparse = this.parseExecutiveCommission(input);
            if (inputparse) {
                return await this.repository.save(inputparse);
            }

        } catch (error) {
            console.error(error);
        }
    }

    private parseExecutiveCommission(input: ExecutiveCommissionsInput): ExecutiveCommissions {
        let executivecommission: ExecutiveCommissions = new ExecutiveCommissions();
        executivecommission.id = input.id;
        executivecommission.agentID = input.agentID;
        executivecommission.idreference = input.idreference;
        executivecommission.amountcomission = input.amountcomission;
        executivecommission.idcurrency = input.idcurrency;
        executivecommission.state = input.state;
        executivecommission.date_in = input.date_in;
        return executivecommission;
    }
}
