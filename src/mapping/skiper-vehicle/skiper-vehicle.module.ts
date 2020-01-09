import { Module, forwardRef } from '@nestjs/common';
import { SkiperVehicleService } from './skiper-vehicle.service';
import { SkiperVehicleResolver } from './skiper-vehicle.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkiperVehicle } from './skiper-vehicle.entity';
import { VehicleCatalogModule } from '../vehicle-catalog/vehicle-catalog.module';
import { VehicleTrademarksModule } from '../vehicle-trademarks/vehicle-trademarks.module';
import { VehicleModelsModule } from '../vehicle-models/vehicle-models.module';
import { SkiperCatTravelsModule } from '../skiper-cat-travels/skiper-cat-travels.module';
import { VehicleYearsModule } from '../vehicle-years/vehicle-years.module';
import { UploadVehicleAppearanceModule } from '../upload-vehicle-appearance/upload-vehicle-appearance.module';

@Module({
  imports: [
    VehicleCatalogModule,
    VehicleTrademarksModule,
    VehicleModelsModule,
    SkiperCatTravelsModule,
    VehicleYearsModule,
    TypeOrmModule.forFeature([SkiperVehicle])],
  providers: [SkiperVehicleService, SkiperVehicleResolver],
  exports: [SkiperVehicleService]
})
export class SkiperVehicleModule { }
