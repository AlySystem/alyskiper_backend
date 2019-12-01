import { Test, TestingModule } from '@nestjs/testing';
import { SkiperUserInvoiceService } from './skiper-user-invoice.service';

describe('SkiperUserInvoiceService', () => {
  let service: SkiperUserInvoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SkiperUserInvoiceService],
    }).compile();

    service = module.get<SkiperUserInvoiceService>(SkiperUserInvoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
