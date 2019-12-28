import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployesService } from './employes.service';
import { Employes } from './employes.entity';
import { EmployesResolver } from './employes.resolver';
import { CountriesModule } from '../countries/countries.module';
import { CitiesModule } from '../cities/cities.module';
import { UserCivilStatusModule } from '../user-civil-status/user-civil-status.module';

@Module({
  imports: [
    CitiesModule,
    CountriesModule,
    UserCivilStatusModule,
    TypeOrmModule.forFeature([Employes])],
  providers: [EmployesService, EmployesResolver],
  exports: [EmployesService]
})
export class EmployesModule { }
