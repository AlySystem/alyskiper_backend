import { Module } from '@nestjs/common';
import { UploadVehicleAppearanceService } from './upload-vehicle-appearance.service';
import { UploadVehicleAppearanceResolver } from './upload-vehicle-appearance.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadVehicleAppearance } from './upload-vehicle-appearance.entity';
import { SkiperVehicleModule } from '../skiper-vehicle/skiper-vehicle.module';

@Module({
  imports: [
    SkiperVehicleModule,
    TypeOrmModule.forFeature([UploadVehicleAppearance])],
  providers: [UploadVehicleAppearanceService, UploadVehicleAppearanceResolver],
  exports: [UploadVehicleAppearanceService]
})
export class UploadVehicleAppearanceModule { }
