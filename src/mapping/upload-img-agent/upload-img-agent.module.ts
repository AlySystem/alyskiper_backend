import { Module } from '@nestjs/common';
import { UploadImgAgentService } from './upload-img-agent.service';
import { UploadImgAgentResolver } from './upload-img-agent.resolver';
import {UploadImgAgent} from './upload-img-agent.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[
    TypeOrmModule.forFeature([UploadImgAgent])
  ],
  providers: [UploadImgAgentService, UploadImgAgentResolver],
  exports:[UploadImgAgentService]
})
export class UploadImgAgentModule {}
