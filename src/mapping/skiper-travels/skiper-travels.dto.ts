import { ObjectType, InputType } from 'type-graphql';
import { UserDto } from '../users/user.dto';
import { SkiperAgentDto } from '../skiper-agent/skiper-agent.dto';
import { SkiperTravelsTracingDto } from '../skiper-travels-tracing/skiper-travels-tracing.dto';
import { SkiperTariffsDto } from '../skiper-tariffs/skiper-tariffs.dto';
import { CurrencyDto } from '../currency/currency.dto';
import { PaymentMethodDto } from '../payment-methods/payment-methods.dto';
import { SkiperCatTravelDto, SilverDto, GoldenDto, VipDto, PresidentDto } from '../skiper-cat-travels/skiper-cat-travel.dto';

@InputType()
export class SkiperTravelsInput {
    id: number;
    idusers: number;
    iddriver: number;
    idcurrency: number;
    idpayment_methods: number;
    lat_initial: number;
    lng_initial: number;
    lat_final_seggested: number;
    lng_final_seggested: number;
    lat_final: number;
    lng_final: number;
    date_init: Date;
    distance: number;
    Total: number;
    time: number;
    address_initial: string;
    address_final: string;
    address_suggested: string;
    categoryId: number;
    state: boolean;
}
@InputType()
export class ValidateSkiperDriveInput {
    iddriver: number;
    idcategoryTravel: number;
    lat_initial: number;
    lng_initial: number;
    date_init: Date;
    distance: number;
    time: number;
    Total: number;
    ip: string;
    idcurrency: number;
}

export class ValidateUserInput {
    userId: number;
    driverId: number;
    categoryTravelId: number;
    latInitial: number;
    lngInitial: number;
    dateInit: Date;
    distance: number;
    time: number;
    Total: number;
    ip: string;
    idcurrency: number;
}

@ObjectType()
export class AllCategoryDto {
    silver: SilverDto;
    golden: GoldenDto;
    vip: VipDto;
    president: PresidentDto;

}

@ObjectType()
export class SkiperTravelsDto {
    id: number;
    lat_initial: number;
    lng_initial: number;
    lat_final_seggested: number;
    lng_final_seggested: number;
    lat_final: number;
    lng_final: number;
    date_init: number;
    date_final: number;
    distance: number;
    total: number;
    address_initial: string;
    address_final: string;
    address_suggested: string;
    duration: number;
    state: boolean;
    users: UserDto;
    skiperagent: SkiperAgentDto;
    skiperTravelsTracing: SkiperTravelsTracingDto;
    currency: CurrencyDto;
    paymentMethods: PaymentMethodDto;
    skipercattravel: SkiperCatTravelDto;
}

@ObjectType()
export class TravelTarifaDTo {
    pricebase: number;
    priceminute: number;
    priceckilometer: number;
    priceminimun: number;
    currencyID: number;
    symbol: string;
}
