import { Module } from '@nestjs/common';
import { HashConfirmedResolver } from './hash-confirmed.resolver';
import { HashConfirmedService } from './hash-confirmed.service';
import { HashConfirmed } from './hash-confirmed.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([HashConfirmed])
  ],
  providers: [HashConfirmedResolver, HashConfirmedService],
  exports: [HashConfirmedService]
})
export class HashConfirmedModule { }
