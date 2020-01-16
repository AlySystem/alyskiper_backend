import { uploadimagebanner } from './uploadimagebanner.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadimagebannerService {
    constructor(
        @InjectRepository(uploadimagebanner) private readonly repository: Repository<uploadimagebanner>
    ) { }
    async getAll(): Promise<uploadimagebanner[]> {
        try {
            return await this.repository.find();
        } catch (error) {
            console.error(error);
        }
    }
}
