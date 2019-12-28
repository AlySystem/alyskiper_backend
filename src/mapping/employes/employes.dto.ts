import { InputType, ObjectType } from "type-graphql";
import { citiesDto } from "../cities/cities.dto";
import { countrieDto } from "../countries/countrie.dto";
import { UserCivilStatusDto } from "../user-civil-status/user-civil-status.dto";
import { SkiperAgentDto } from "../skiper-agent/skiper-agent.dto";
import { SkiperWalletDto } from "../skiper-wallet/skiper-wallet.dto";

@InputType()
export class EmployesInput {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    user: string;
    password: string;
    address: string;
    phone: string;
    create_at: Date;
    date_birth: Date;
    avatar: string;
    country_id: number;
    city_id: number;
    idcivil_status: number;
}

@InputType()
export class EmployesUpdatePassword {
    id: number;
    oldPassword: string;
    newPassword: string;
}

@InputType()
export class ChangePasswordEmailInput {
    email: string;
    password: string;
    repeatpassword: string;
}

@InputType()
export class EmployesUpdateInput {
    id: number;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    phone: string;
    country_id: number;
    city_id: number;
    avatar: string;
}

@ObjectType()
export class EmployesDto {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    user: string;
    password: string;
    address: string;
    phone: string;
    create_at: Date;
    date_birth: Date;
    avatar: string;
    city: citiesDto;
    country: countrieDto;
    civilStatus: UserCivilStatusDto;
    skiperAgent: SkiperAgentDto[]
    skiperWallet: SkiperWalletDto[]
}

@ObjectType()
export class ChangePassDto {
    message: Boolean;
}