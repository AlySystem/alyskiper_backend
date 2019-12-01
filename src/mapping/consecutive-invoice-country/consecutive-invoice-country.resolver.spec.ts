import { Test, TestingModule } from '@nestjs/testing';
import { ConsecutiveInvoiceCountryResolver } from './consecutive-invoice-country.resolver';

describe('ConsecutiveInvoiceCountryResolver', () => {
  let resolver: ConsecutiveInvoiceCountryResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConsecutiveInvoiceCountryResolver],
    }).compile();

    resolver = module.get<ConsecutiveInvoiceCountryResolver>(ConsecutiveInvoiceCountryResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
