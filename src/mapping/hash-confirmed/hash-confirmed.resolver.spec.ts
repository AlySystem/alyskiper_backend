import { Test, TestingModule } from '@nestjs/testing';
import { HashConfirmedResolver } from './hash-confirmed.resolver';

describe('HashConfirmedResolver', () => {
  let resolver: HashConfirmedResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashConfirmedResolver],
    }).compile();

    resolver = module.get<HashConfirmedResolver>(HashConfirmedResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
