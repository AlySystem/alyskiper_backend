import { Test, TestingModule } from '@nestjs/testing';
import { DetailAlycoinInvoiceResolver } from './detail-alycoin-invoice.resolver';

describe('DetailAlycoinInvoiceResolver', () => {
  let resolver: DetailAlycoinInvoiceResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetailAlycoinInvoiceResolver],
    }).compile();

    resolver = module.get<DetailAlycoinInvoiceResolver>(DetailAlycoinInvoiceResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
