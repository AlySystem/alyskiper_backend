import { Test, TestingModule } from '@nestjs/testing';
import { UploadimagebannerResolver } from './uploadimagebanner.resolver';

describe('UploadimagebannerResolver', () => {
  let resolver: UploadimagebannerResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadimagebannerResolver],
    }).compile();

    resolver = module.get<UploadimagebannerResolver>(UploadimagebannerResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
