import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExecutiveCommissions } from './executive-commissions.entity'
import { Repository } from 'typeorm';

@Injectable()
export class ExecutiveCommissionsService {
    constructor(
        @InjectRepository(ExecutiveCommissions)
        private readonly repository:Repository<ExecutiveCommissions>
    ){}
}
