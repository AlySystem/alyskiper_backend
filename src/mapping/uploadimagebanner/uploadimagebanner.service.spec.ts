import { Test, TestingModule } from '@nestjs/testing';
import { UploadimagebannerService } from './uploadimagebanner.service';

describe('UploadimagebannerService', () => {
  let service: UploadimagebannerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadimagebannerService],
    }).compile();

    service = module.get<UploadimagebannerService>(UploadimagebannerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
