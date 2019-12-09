import { Test, TestingModule } from '@nestjs/testing';
import { AlycoinInvoicesService } from './alycoin-invoices.service';

describe('AlycoinInvoicesService', () => {
  let service: AlycoinInvoicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlycoinInvoicesService],
    }).compile();

    service = module.get<AlycoinInvoicesService>(AlycoinInvoicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
