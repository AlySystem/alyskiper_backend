import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRateResolver } from './exchange-rate.resolver';

describe('ExchangeRateResolver', () => {
  let resolver: ExchangeRateResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExchangeRateResolver],
    }).compile();

    resolver = module.get<ExchangeRateResolver>(ExchangeRateResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
