import { InputType, ObjectType } from "type-graphql";
import { citiesDto } from "../cities/cities.dto";
import { countrieDto } from "../countries/countrie.dto";
import { UserCivilStatusDto } from "../user-civil-status/user-civil-status.dto";
import { SkiperAgentDto } from "../skiper-agent/skiper-agent.dto";
import { SkiperWalletDto, SkiperWalletCryptoDto, SkiperWalletLocalDto, pruebaDto, Bitcoin, LiteCoin, Ethereum, Alycoin, Dash } from '../skiper-wallet/skiper-wallet.dto';

@InputType()
export class UserInput {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    user: string;
    password: string;
    sponsor_id: number;
    address: string;
    phone: string;
    create_at: Date;
    date_birth: Date;
    is_online: boolean;
    avatar: string;
    country_id: number;
    city_id: number;
    idcivil_status: number;
}

@InputType()
export class UserUpdatePassword {
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
export class UserUpdateInput {
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
export class UserDto {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    user: string;
    password: string;
    sponsor_id: number = null;
    address: string;
    phone: string;
    create_at: Date;
    date_birth: Date;
    is_online: boolean = false;
    avatar: string;
    city: citiesDto;
    country: countrieDto;
    civilStatus: UserCivilStatusDto;
    skiperAgent: SkiperAgentDto[]
    skiperWalletLocal: SkiperWalletLocalDto[]
}
@ObjectType()
export class UserCryptoDto {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    user: string;
    password: string;
    sponsor_id: number = null;
    address: string;
    phone: string;
    create_at: Date;
    date_birth: Date;
    is_online: boolean = false;
    avatar: string;
    city: citiesDto;
    country: countrieDto;
    civilStatus: UserCivilStatusDto;
    skiperAgent: SkiperAgentDto[];
    skiperWallet: SkiperWalletCryptoDto[];
    token_reset: string;
    resetPasswordExpires: Date;
    pin: number;
}
@ObjectType()
export class CryptosDto {
    bitcoin: Bitcoin;
    litecoin: LiteCoin;
    dash: Dash;
    alycoin: Alycoin;
    ethereum: Ethereum;
}
@ObjectType()
export class ChangePassDto {
    message: Boolean;
}