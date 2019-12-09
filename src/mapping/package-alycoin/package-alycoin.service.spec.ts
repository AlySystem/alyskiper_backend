import { Test, TestingModule } from '@nestjs/testing';
import { PackageAlycoinService } from './package-alycoin.service';

describe('PackageAlycoinService', () => {
  let service: PackageAlycoinService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PackageAlycoinService],
    }).compile();

    service = module.get<PackageAlycoinService>(PackageAlycoinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
