import { Module } from '@nestjs/common';
import { SkiperRatingService } from './skiper-rating.service';
import { SkiperRatingResolver } from './skiper-rating.resolver';
import { SkiperRating } from './skiper-rating.entity';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkiperAgentModule } from '../skiper-agent/skiper-agent.module';

@Module({
  imports: [
    SkiperAgentModule,
    UsersModule,
    TypeOrmModule.forFeature([SkiperRating])
  ],
  providers: [SkiperRatingService, SkiperRatingResolver],
  exports: [SkiperRatingService]
})
export class SkiperRatingModule { }
