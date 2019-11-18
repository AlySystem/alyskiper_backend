import { Test, TestingModule } from '@nestjs/testing';
import { PaymentCryptoCurrencyService } from './payment-crypto-currency.service';

describe('PaymentCryptoCurrencyService', () => {
  let service: PaymentCryptoCurrencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentCryptoCurrencyService],
    }).compile();

    service = module.get<PaymentCryptoCurrencyService>(PaymentCryptoCurrencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
