import { Injectable } from '@nestjs/common';
import { balanceAccumulatedDriver } from './balance-accumulated-driver.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BalanceAccumulatedDriverService {
    constructor(
        @InjectRepository(balanceAccumulatedDriver)
        private readonly respository:Repository<balanceAccumulatedDriver>
    ) { }
}
