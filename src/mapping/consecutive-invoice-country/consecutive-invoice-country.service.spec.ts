import { Test, TestingModule } from '@nestjs/testing';
import { ConsecutiveInvoiceCountryService } from './consecutive-invoice-country.service';

describe('ConsecutiveInvoiceCountryService', () => {
  let service: ConsecutiveInvoiceCountryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConsecutiveInvoiceCountryService],
    }).compile();

    service = module.get<ConsecutiveInvoiceCountryService>(ConsecutiveInvoiceCountryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
