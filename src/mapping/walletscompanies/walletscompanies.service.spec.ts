import { Test, TestingModule } from '@nestjs/testing';
import { WalletscompaniesService } from './walletscompanies.service';

describe('WalletscompaniesService', () => {
  let service: WalletscompaniesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletscompaniesService],
    }).compile();

    service = module.get<WalletscompaniesService>(WalletscompaniesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
