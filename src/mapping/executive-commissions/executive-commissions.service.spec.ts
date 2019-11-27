import { Test, TestingModule } from '@nestjs/testing';
import { ExecutiveCommissionsService } from './executive-commissions.service';

describe('ExecutiveCommissionsService', () => {
  let service: ExecutiveCommissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExecutiveCommissionsService],
    }).compile();

    service = module.get<ExecutiveCommissionsService>(ExecutiveCommissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
