import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UploadVehicleAppearanceService } from './upload-vehicle-appearance.service'
import { UploadVehicleAppearanceInput } from './upload-vehicle-appearance.dto';


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

    @Mutation()
    async updateUploadVehicleAppearance(@Args('input') input: UploadVehicleAppearanceInput) {
        return await this.uploadAppearanceVehicleService.update(input);
    }
    @Mutation()
    async createUploadVehicleAppearance(@Args('input') input: UploadVehicleAppearanceInput) {
        return await this.uploadAppearanceVehicleService.create(input);
    }


}
