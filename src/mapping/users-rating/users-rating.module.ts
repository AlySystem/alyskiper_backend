import { Module } from '@nestjs/common';
import { UsersRatingService } from './users-rating.service';
import { UsersRatingResolver } from './users-rating.resolver';
import { UsersRating } from './users-rating.entity';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkiperAgentModule } from '../skiper-agent/skiper-agent.module';

@Module({
  imports: [
    SkiperAgentModule,
    UsersModule,
    TypeOrmModule.forFeature([UsersRating])
  ],
  providers: [UsersRatingService, UsersRatingResolver],
  exports: [UsersRatingService]
})
export class UsersRatingModule { }
