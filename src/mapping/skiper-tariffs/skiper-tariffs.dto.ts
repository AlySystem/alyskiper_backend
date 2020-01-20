import { ObjectType, InputType } from "type-graphql";
import { SkiperCatTravelDto } from "../skiper-cat-travels/skiper-cat-travel.dto";
import { DriverScheduleDto } from "../skiper-driver-schedule/skiper-driver-schedule.dto";
import { countrieDto } from "../countries/countrie.dto";
import { citiesDto } from "../cities/cities.dto";
import { SkiperTariffs } from "./skiper-tariffs.entity";

@ObjectType()
export class SkiperTariffsDto {
    id:number;
    idSkiperCatTravels: SkiperCatTravelDto;
    idDriverSchedule: DriverScheduleDto;
    price_base: number;
    price_minute: number;
    price_kilometer:  number;
    price_minimum: number;
    idCountry: countrieDto;
    idCity: citiesDto;
    symbol: string;
}

@InputType()
export class SkiperTariffsInput {
    id:number;
    idSkiperCatTravels: number;
    idDriverSchedule: number;
    price_base: number;
    price_minute: number;
    price_kilometer:  number;
    price_minimum: number;
    idCountry: number;
    idCity: number;
    symbol: string;
}

@InputType()
export class SkiperTariffsFilterInput {
    idCountry: number;
    idCity: number;
    idSchedule: number;
    idCatTravel: number;
}

@ObjectType()
export class TariffBatchLog {
    tariffInput: String;
    status: string;
    error: string;
}