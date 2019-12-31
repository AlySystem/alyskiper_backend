import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../mapping/users/user.entity';
import { UserService } from "../mapping/users/user.service";
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../mapping/users/users.module';
import { AuthResolver } from './auth.resolver';
import { CountriesModule } from '../mapping/countries/countries.module';
import { CitiesModule } from '../mapping/cities/cities.module';
import { SkiperAgentModule } from '../mapping/skiper-agent/skiper-agent.module';
import { UserCivilStatusModule } from '../mapping/user-civil-status/user-civil-status.module';
import { SkiperWalletModule } from '../mapping/skiper-wallet/skiper-wallet.module';

@Module({
    imports: [
        SkiperWalletModule,
        UsersModule,
        CitiesModule,
        CountriesModule,
        SkiperAgentModule,
        UserCivilStatusModule,
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
            privateKey: process.env.PRIVATE_KEY || 'supersecretamazingkey'
        }),
    ],
    providers: [UserService, AuthService, JwtStrategy, AuthResolver]
})
export class AuthModule { }