import { Test, TestingModule } from '@nestjs/testing';
import { SkiperInvoiceDetailResolver } from './skiper-invoice-detail.resolver';

describe('SkiperInvoiceDetailResolver', () => {
  let resolver: SkiperInvoiceDetailResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SkiperInvoiceDetailResolver],
    }).compile();

    resolver = module.get<SkiperInvoiceDetailResolver>(SkiperInvoiceDetailResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
