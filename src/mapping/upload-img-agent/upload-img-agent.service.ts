import { Injectable } from '@nestjs/common';
import { UploadImgAgent } from './upload-img-agent.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UploadImgAgentService {
    constructor(
        @InjectRepository(UploadImgAgent)
        private readonly repository: Repository<UploadImgAgent>
    ) { }

    async getById(idagent: number): Promise<UploadImgAgent> {
        try {
            return await this.repository.findOneOrFail({ where: { id_skiper_agent: idagent } });        
        } catch (error) {
            console.log(error)
        }
    }
}
