import { Test, TestingModule } from '@nestjs/testing';
import { ExecutiveCommissionsResolver } from './executive-commissions.resolver';

describe('ExecutiveCommissionsResolver', () => {
  let resolver: ExecutiveCommissionsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExecutiveCommissionsResolver],
    }).compile();

    resolver = module.get<ExecutiveCommissionsResolver>(ExecutiveCommissionsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
