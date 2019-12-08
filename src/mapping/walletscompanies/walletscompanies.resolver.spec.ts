import { Test, TestingModule } from '@nestjs/testing';
import { WalletscompaniesResolver } from './walletscompanies.resolver';

describe('WalletscompaniesResolver', () => {
  let resolver: WalletscompaniesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletscompaniesResolver],
    }).compile();

    resolver = module.get<WalletscompaniesResolver>(WalletscompaniesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
