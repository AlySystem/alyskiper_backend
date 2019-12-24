import { Module, forwardRef } from '@nestjs/common';
import { SkiperVehicleAgentService } from './skiper-vehicle-agent.service';
import { SkiperVehicleAgentResolver } from './skiper-vehicle-agent.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkiperVehicleAgent } from './skiper-vehicle-agent.entity';
import { SkiperVehicleModule } from '../skiper-vehicle/skiper-vehicle.module';
import { SkiperAgentModule } from '../skiper-agent/skiper-agent.module';

@Module({
  imports: [
    forwardRef(() => SkiperVehicleModule),
    forwardRef(() => SkiperAgentModule),
    TypeOrmModule.forFeature([SkiperVehicleAgent])],
  providers: [SkiperVehicleAgentService, SkiperVehicleAgentResolver],
  exports: [SkiperVehicleAgentService]
})
export class SkiperVehicleAgentModule { }
