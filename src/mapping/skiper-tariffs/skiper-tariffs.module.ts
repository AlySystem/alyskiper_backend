import { Module } from '@nestjs/common';
import { SkiperTariffsService } from './skiper-tariffs.service';
import { SkiperTariffsResolver } from './skiper-tariffs.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkiperTariffs } from './skiper-tariffs.entity';
import { SkiperDriverScheduleModule } from '../skiper-driver-schedule/skiper-driver-schedule.module';
import { SkiperCatTravelsModule } from '../skiper-cat-travels/skiper-cat-travels.module';
import { CountriesModule } from '../countries/countries.module';
import { CitiesModule } from '../cities/cities.module';

@Module({
  imports:[
    SkiperCatTravelsModule,
    SkiperDriverScheduleModule,
    CountriesModule,
    CitiesModule,
    TypeOrmModule.forFeature([SkiperTariffs])
  ],
  providers: [SkiperTariffsService, SkiperTariffsResolver],
  exports:[SkiperTariffsService]
})
export class SkiperTariffsModule {}
