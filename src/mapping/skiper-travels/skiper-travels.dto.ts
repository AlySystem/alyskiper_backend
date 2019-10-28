import { ObjectType, InputType } from 'type-graphql';
import { UserDto } from '../users/user.dto';
import { SkiperAgentDto } from '../skiper-agent/skiper-agent.dto';
import { SkiperTravelsTracingDto } from '../skiper-travels-tracing/skiper-travels-tracing.dto';
import { SkiperTariffsDto } from '../skiper-tariffs/skiper-tariffs.dto';

@InputType()
export class SkiperTravelsInput {
    id: number;
    idusers: number;
    iddriver: number;
    lat_initial: number;
    lng_initial: number;
    lat_final_seggested: number;
    lng_final_seggested:number;
    lat_final: number;
    lng_final: number;
    date_init: Date;
    distance: number;
    Total: number;
    time: number;
    address_initial: string;
    address_final: string;
    address_suggested: string;
}

@ObjectType()
export class SkiperTravelsDto {
    id: number;
    lat_initial: number;
    lng_initial: number;
    lat_final_seggested: number;
    lng_final_seggested:number;
    lat_final: number;
    lng_final: number;
    date_init: number;
    date_final: number;
    distance: number;
    total: number;
    address_initial: string;
    address_final: string;
    address_suggested: string;
    users: UserDto;
    skiperagent: SkiperAgentDto;
    skiperTravelsTracing: SkiperTravelsTracingDto;
}

@ObjectType()
export class TravelTarifaDTo {
    pricebase: number;
    priceminute: number;
    priceckilometer: number;
    priceminimun: number;
}
