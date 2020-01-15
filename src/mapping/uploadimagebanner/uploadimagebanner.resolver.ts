import { Resolver, Query } from '@nestjs/graphql';
import { UploadimagebannerService } from './uploadimagebanner.service';

@Resolver('Uploadimagebanner')
export class UploadimagebannerResolver {
    constructor(
        private readonly uploadimagebannerService: UploadimagebannerService
    ) { }

    @Query('getAllImageBanner')
    async getAllImageBanner() {
        return this.uploadimagebannerService.getAll();
    }

}
