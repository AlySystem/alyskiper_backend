import { Test, TestingModule } from '@nestjs/testing';
import { BillingConceptResolver } from './billing-concept.resolver';

describe('BillingConceptResolver', () => {
  let resolver: BillingConceptResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BillingConceptResolver],
    }).compile();

    resolver = module.get<BillingConceptResolver>(BillingConceptResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
