import { Module } from '@nestjs/common';
import { WalletscompaniesResolver } from './walletscompanies.resolver';
import { WalletscompaniesService } from './walletscompanies.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsCompanies } from './walletscompanies.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletsCompanies])
  ],
  providers: [WalletscompaniesResolver, WalletscompaniesService],
  exports: [WalletscompaniesService]
})
export class WalletscompaniesModule { }
