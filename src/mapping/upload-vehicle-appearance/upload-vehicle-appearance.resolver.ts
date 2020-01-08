import { Resolver, Query, Args } from '@nestjs/graphql';
import { UploadVehicleAppearanceService } from './upload-vehicle-appearance.service'


@Resolver('UploadVehicleAppearance')
export class UploadVehicleAppearanceResolver {
    constructor(
        private readonly uploadAppearanceVehicleService: UploadVehicleAppearanceService
    ) { }

    @Query('getAllUploadVehicleAppearance')
    async getAllUploadVehicleAppearance() {
        console.log('1');
        return await this.uploadAppearanceVehicleService.getAll();
    }
    @Query()
    async getByIdUploadVehicleAppearance(@Args('id') id: number) {
        return await this.uploadAppearanceVehicleService.getById(id);
    }


}
