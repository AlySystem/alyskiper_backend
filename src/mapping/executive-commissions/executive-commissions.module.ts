import { Module } from '@nestjs/common';
import { ExecutiveCommissionsResolver } from './executive-commissions.resolver';
import { ExecutiveCommissionsService } from './executive-commissions.service';
import { SkiperAgentModule } from '../skiper-agent/skiper-agent.module';
import { CountriesModule } from '../countries/countries.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutiveCommissions } from './executive-commissions.entity';

@Module({
  imports: [
    CountriesModule,
    SkiperAgentModule,
    TypeOrmModule.forFeature([ExecutiveCommissions])
  ],
  providers: [ExecutiveCommissionsResolver, ExecutiveCommissionsService],
  exports: [ExecutiveCommissionsService]
})
export class ExecutiveCommissionsModule { }
