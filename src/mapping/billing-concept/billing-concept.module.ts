import { Module } from '@nestjs/common';
import { BillingConceptService } from './billing-concept.service';
import { BillingConceptResolver } from './billing-concept.resolver';
import { BillingConcept } from './billing-concept.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([BillingConcept])
  ],
  providers: [BillingConceptService, BillingConceptResolver],
  exports: [BillingConceptService]
})
export class BillingConceptModule { }
