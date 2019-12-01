import { Test, TestingModule } from '@nestjs/testing';
import { SkiperInvoiceDetailService } from './skiper-invoice-detail.service';

describe('SkiperInvoiceDetailService', () => {
  let service: SkiperInvoiceDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SkiperInvoiceDetailService],
    }).compile();

    service = module.get<SkiperInvoiceDetailService>(SkiperInvoiceDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
