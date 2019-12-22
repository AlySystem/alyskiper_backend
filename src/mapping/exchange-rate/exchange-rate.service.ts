import { Injectable } from '@nestjs/common';
import { ExchangeRate } from './exchange-rate.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ExchangeRateService {
    constructor(
        @InjectRepository(ExchangeRate)
        private readonly repository: Repository<ExchangeRate>
    ) { }

}
