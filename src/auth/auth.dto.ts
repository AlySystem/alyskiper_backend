import { ObjectType, InputType } from "type-graphql";
import { CommerceDto } from "src/mapping/skiper-commerce/skiper-commerce.dto";
import { SkiperVehicleAgentDto } from "src/mapping/skiper-vehicle-agent/skiper-vehicle-agent.dto";
import { SkiperVehicleDto } from "src/mapping/skiper-vehicle/skiper-vehicle.dto";
import { countrieDto } from "src/mapping/countries/countrie.dto";
import { UserDto } from "src/mapping/users/user.dto";
import { citiesDto } from "src/mapping/cities/cities.dto";
import { SkiperWalletDto } from "src/mapping/skiper-wallet/skiper-wallet.dto";
import { CurrencyDto } from '../mapping/currency/currency.dto';

@InputType()
export class signInDto {
    email: string;
    password: string;
}

@ObjectType()
export class SignInOk {

    constructor(token, firstname, lastname, username, email,
        phone_number, avatar, country, commerce?, vehicle?, wallet?, currency?, active_city?, city?) {
        this.token = token;
        this.firstname = firstname;
        this.lastname = lastname;
        this.username = username;
        this.email = email;
        this.phone_number = phone_number;
        this.avatar = avatar || "";
        this.country = country || null;
        this.city = city || null;
        this.commerce = commerce || null;
        this.vehicle = vehicle || null;
        this.wallet = wallet || null;
        this.currency = currency || null;
        this.active_city = active_city || false;
    }

    token: string
    firstname: string
    lastname: string
    username: string
    email: string
    phone_number: string
    avatar: string
    city: citiesDto
    country: countrieDto
    commerce: CommerceDto
    vehicle: SkiperVehicleDto
    wallet: SkiperWalletDto
    currency: CurrencyDto
    active_city: boolean;
}

@ObjectType()
export class ErrorResponse {

    constructor(message?, status?, ok?) {
        this.message = message || null;
        this.status = status || null;;
        this.ok = ok || false;
    }

    message: string;
    status: number;
    ok: boolean;
}

@ObjectType()
export class SignResponse {

    constructor(data, error) {
        this.data = data;
        this.error = error
    }

    data: SignInOk;
    error: ErrorResponse;
}

@InputType()
export class twilioDto {

    phone_number: string;
    channel?: string;
    code?: string;
}

@ObjectType()
export class ResetDto {

    constructor(data, error) {
        this.data = data;
        this.error = error
    }

    error: ErrorResponse;
    data: UserDto;
}