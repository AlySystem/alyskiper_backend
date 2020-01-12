import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkiperAgent } from './skiper-agent.entity';
import { SkiperAgentService } from './skiper-agent.service';
import { SkiperAgentResolver } from './skiper-agent.resolver';
import { UsersModule } from '../users/users.module';
import { CategoryAgentModule } from '../category-agent/category-agent.module';
import { SkiperTravelsModule } from '../skiper-travels/skiper-travels.module';
import { SkiperVehicleModule } from '../skiper-vehicle/skiper-vehicle.module';
import { SkiperVehicleAgentModule } from '../skiper-vehicle-agent/skiper-vehicle-agent.module';
import { UploadVehicleAppearanceModule } from '../upload-vehicle-appearance/upload-vehicle-appearance.module';
import { UploadVehicleLegalDocModule } from '../upload-vehicle-legal-doc/upload-vehicle-legal-doc.module';

@Module({
    imports: [
        UsersModule,
        UploadVehicleLegalDocModule,
        CategoryAgentModule,
        UploadVehicleAppearanceModule,
        forwardRef(() => SkiperTravelsModule),
        SkiperVehicleModule,
        SkiperVehicleAgentModule,
        TypeOrmModule.forFeature([SkiperAgent])],
    providers: [SkiperAgentService, SkiperAgentResolver],
    exports: [SkiperAgentService]
})
export class SkiperAgentModule { }
