import { Test, TestingModule } from '@nestjs/testing';
import { BillingConceptService } from './billing-concept.service';

describe('BillingConceptService', () => {
  let service: BillingConceptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BillingConceptService],
    }).compile();

    service = module.get<BillingConceptService>(BillingConceptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
