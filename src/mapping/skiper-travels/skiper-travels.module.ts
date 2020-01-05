import { Module, forwardRef } from '@nestjs/common';
import { SkiperTravelsService } from './skiper-travels.service';
import { SkiperTravelsResolver } from './skiper-travels.resolver';
import { SkiperTravels } from './skiper-travels.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkiperAgentModule } from '../skiper-agent/skiper-agent.module';
import { UsersModule } from '../users/users.module';
import { SkiperTravelsTracingModule } from '../skiper-travels-tracing/skiper-travels-tracing.module';
import { SkiperWalletModule } from '../skiper-wallet/skiper-wallet.module';
import { SkiperCatTravelsModule } from '../skiper-cat-travels/skiper-cat-travels.module';

@Module({
  imports: [
    forwardRef(() => SkiperAgentModule),
    SkiperWalletModule,
    SkiperCatTravelsModule,
    UsersModule,
    forwardRef(() => SkiperTravelsTracingModule),
    TypeOrmModule.forFeature([SkiperTravels]),
  ],
  providers: [SkiperTravelsService, SkiperTravelsResolver],
  exports: [SkiperTravelsService]

})
export class SkiperTravelsModule { }
