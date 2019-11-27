import { Module } from '@nestjs/common';
import { ExecutiveCommissionsResolver } from './executive-commissions.resolver';
import { ExecutiveCommissionsService } from './executive-commissions.service';
import { SkiperAgentModule } from '../skiper-agent/skiper-agent.module';
import { CountriesModule } from '../countries/countries.module';

@Module({
  imports: [
    CountriesModule,
    SkiperAgentModule,
  ],
  providers: [ExecutiveCommissionsResolver, ExecutiveCommissionsService],
  exports: [ExecutiveCommissionsService]
})
export class ExecutiveCommissionsModule { }
