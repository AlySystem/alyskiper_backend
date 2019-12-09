import { Test, TestingModule } from '@nestjs/testing';
import { DetailAlycoinInvoiceService } from './detail-alycoin-invoice.service';

describe('DetailAlycoinInvoiceService', () => {
  let service: DetailAlycoinInvoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetailAlycoinInvoiceService],
    }).compile();

    service = module.get<DetailAlycoinInvoiceService>(DetailAlycoinInvoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
