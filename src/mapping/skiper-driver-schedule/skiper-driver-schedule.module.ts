import { Module } from '@nestjs/common';
import { SkiperDriverScheduleService } from './skiper-driver-schedule.service';
import { SkiperDriverScheduleResolver } from './skiper-driver-schedule.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkiperDriverSchedule } from './skiper-driver-schedule.entity';

@Module({
  imports:[TypeOrmModule.forFeature([SkiperDriverSchedule])],
  providers: [SkiperDriverScheduleService, SkiperDriverScheduleResolver],
  exports:[SkiperDriverScheduleService]
})
export class SkiperDriverScheduleModule {}
