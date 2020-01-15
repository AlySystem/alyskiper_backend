import { Module } from '@nestjs/common';
import { UploadimagebannerService } from './uploadimagebanner.service';
import { UploadimagebannerResolver } from './uploadimagebanner.resolver';
import { uploadimagebanner } from './uploadimagebanner.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([uploadimagebanner])],
  providers: [UploadimagebannerService, UploadimagebannerResolver],
  exports: [UploadimagebannerService]
})
export class UploadimagebannerModule { }
