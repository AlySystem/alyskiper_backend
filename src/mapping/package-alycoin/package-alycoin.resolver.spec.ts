import { Test, TestingModule } from '@nestjs/testing';
import { PackageAlycoinResolver } from './package-alycoin.resolver';

describe('PackageAlycoinResolver', () => {
  let resolver: PackageAlycoinResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PackageAlycoinResolver],
    }).compile();

    resolver = module.get<PackageAlycoinResolver>(PackageAlycoinResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
