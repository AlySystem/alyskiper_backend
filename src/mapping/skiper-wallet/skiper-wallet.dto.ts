import { InputType, ObjectType } from 'type-graphql';
import { UserDto } from '../users/user.dto';
import { CurrencyDto } from '../currency/currency.dto';
import { countrieDto } from '../countries/countrie.dto';

@InputType()
export class SkiperWalletInput {
    id: number;
    iduser: number;
    amount: number;
    amount_crypto: number;
    idcurrency: number;
    idcountry: number;
    minimun: number;
    bretirar: boolean;
    date_in: Date;
}
@InputType()
export class SkiperWalletCreateInput {
    id: number;
    iduser: number;
    idcurrency: number;
    idcountry: number;
    minimun: number;
    bretirar: boolean;
    lat: number;
    long: number;
}

@ObjectType()
export class SendDataForPayCrypto {
    crypto: string;
    concept: string;
    company: string;
    walletReceive: string;
    amounSend: number;
    numberFact: number;
    nameUser: string;
    state: boolean
    priceUsd: number;
}

@ObjectType()
export class SkiperWalletLocalDto {
    id: number;
    amount: number;
    minimun: number;
    bretirar: boolean;
    date_in: Date;
    userID: UserDto;
    currencyID: CurrencyDto;
    countryID: countrieDto;
}

@ObjectType()
export class SkiperWalletDto {
    id: number;
    amount: number;
    amount_crypto: number;
    minimun: number;
    bretirar: boolean;
    date_in: Date;
    userID: UserDto;
    currencyID: CurrencyDto;
    countryID: countrieDto;
}
@ObjectType()
export class dataConvert {
    amountCrypto:number;
    amountUsd:number;
    priceCrypto:number;
}
@ObjectType()
export class pruebaDto {
    id: number;
}

@ObjectType()
export class Bitcoin {
    id: number;
    amount_crypto: number;
    name: string;
    url_img: string;
    price_usd: number;
    price_local: number;
    price_crypto: number;
    priceTravel: number;
    change24h: number;
}

@ObjectType()
export class Ethereum {
    id: number;
    amount_crypto: number;
    name: string;
    url_img: string;
    price_usd: number;
    price_local: number;
    price_crypto: number;
    priceTravel: number;
    change24h: number;
}

@ObjectType()
export class LiteCoin {
    id: number;
    amount_crypto: number;
    name: string;
    url_img: string;
    price_usd: number;
    price_local: number;
    price_crypto: number;
    priceTravel: number;
    change24h: number;
}

@ObjectType()
export class Dash {
    id: number;
    amount_crypto: number;
    name: string;
    url_img: string;
    price_usd: number;
    price_local: number;
    price_crypto: number;
    priceTravel: number;
    change24h: number;
}

@ObjectType()
export class Alycoin {
    id: number;
    amount_crypto: number;
    name: string;
    url_img: string;
    price_usd: number;
    price_local: number;
    price_crypto: number;
    priceTravel: number;
}

@ObjectType()
export class SkiperWalletCryptoDto {
    id: number;
    amount_crypto: number;
    minimun: number;
    bretirar: boolean;
    date_in: Date;
    userID: UserDto;
    currencyID: CurrencyDto;
    countryID: countrieDto;
}