import { Test, TestingModule } from '@nestjs/testing';
import { SkiperRatingService } from './skiper-rating.service';

describe('SkiperRatingService', () => {
  let service: SkiperRatingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SkiperRatingService],
    }).compile();

    service = module.get<SkiperRatingService>(SkiperRatingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
