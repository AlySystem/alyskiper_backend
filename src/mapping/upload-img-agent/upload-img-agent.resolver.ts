import { Resolver, Args, Query } from '@nestjs/graphql';
import { UploadImgAgentService } from './upload-img-agent.service';

@Resolver('UploadImgAgent')
export class UploadImgAgentResolver {
    constructor(
        private readonly uploadimgAgentservice: UploadImgAgentService
    ) { }

    @Query()
    async getUploadImgAgentByAgent(@Args('idagent') idagent: number) {
        return await this.uploadimgAgentservice.getById(idagent);
    }

    @Query()
    async getAllImages(@Args('idagent') idagent: number){
        return await this.uploadimgAgentservice.getAllImages(idagent)
    }
}
