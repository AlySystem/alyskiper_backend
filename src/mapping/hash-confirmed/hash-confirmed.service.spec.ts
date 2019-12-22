import { Test, TestingModule } from '@nestjs/testing';
import { HashConfirmedService } from './hash-confirmed.service';

describe('HashConfirmedService', () => {
  let service: HashConfirmedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashConfirmedService],
    }).compile();

    service = module.get<HashConfirmedService>(HashConfirmedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
