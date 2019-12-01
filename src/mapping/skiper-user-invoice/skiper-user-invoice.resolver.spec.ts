import { Test, TestingModule } from '@nestjs/testing';
import { SkiperUserInvoiceResolver } from './skiper-user-invoice.resolver';

describe('SkiperUserInvoiceResolver', () => {
  let resolver: SkiperUserInvoiceResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SkiperUserInvoiceResolver],
    }).compile();

    resolver = module.get<SkiperUserInvoiceResolver>(SkiperUserInvoiceResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
