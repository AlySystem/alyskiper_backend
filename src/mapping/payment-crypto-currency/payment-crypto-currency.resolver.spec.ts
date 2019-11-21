import { Test, TestingModule } from '@nestjs/testing';
import { PaymentCryptoCurrencyResolver } from './payment-crypto-currency.resolver';

describe('PaymentCryptoCurrencyResolver', () => {
  let resolver: PaymentCryptoCurrencyResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentCryptoCurrencyResolver],
    }).compile();

    resolver = module.get<PaymentCryptoCurrencyResolver>(PaymentCryptoCurrencyResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
