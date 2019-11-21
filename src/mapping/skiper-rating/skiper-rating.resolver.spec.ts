import { Test, TestingModule } from '@nestjs/testing';
import { SkiperRatingResolver } from './skiper-rating.resolver';

describe('SkiperRatingResolver', () => {
  let resolver: SkiperRatingResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SkiperRatingResolver],
    }).compile();

    resolver = module.get<SkiperRatingResolver>(SkiperRatingResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
