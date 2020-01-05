import { Module } from '@nestjs/common';
import { CountrieService } from './countrie.service';
import { Countrie } from './countrie.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountriesResolver } from './countries.resolver';

@Module({
  imports: [   
    TypeOrmModule.forFeature([Countrie])
  ],
  providers: [CountrieService, CountriesResolver],
  exports: [CountrieService]
})
export class CountriesModule { }
