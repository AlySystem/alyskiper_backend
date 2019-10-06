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

@Module({
    imports: [
        UsersModule,
        CitiesModule,
        CountriesModule,
        SkiperAgentModule,
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
            privateKey: process.env.PRIVATE_KEY || 'supersecretamazingkey'
        }),
    ],
    providers: [UserService, AuthService,JwtStrategy, AuthResolver]
})
export class AuthModule {}