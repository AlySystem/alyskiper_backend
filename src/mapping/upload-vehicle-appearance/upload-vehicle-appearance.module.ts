import { Module } from '@nestjs/common';
import { UploadVehicleAppearanceService } from './upload-vehicle-appearance.service';
import { UploadVehicleAppearanceResolver } from './upload-vehicle-appearance.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadVehicleAppearance } from './upload-vehicle-appearance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UploadVehicleAppearance])],
  providers: [UploadVehicleAppearanceService, UploadVehicleAppearanceResolver],
  exports: [UploadVehicleAppearanceService]
})
export class UploadVehicleAppearanceModule { }
