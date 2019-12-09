import { Test, TestingModule } from '@nestjs/testing';
import { AlycoinInvoicesResolver } from './alycoin-invoices.resolver';

describe('AlycoinInvoicesResolver', () => {
  let resolver: AlycoinInvoicesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlycoinInvoicesResolver],
    }).compile();

    resolver = module.get<AlycoinInvoicesResolver>(AlycoinInvoicesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
