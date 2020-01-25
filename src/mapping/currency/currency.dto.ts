import { InputType, ObjectType } from "type-graphql";
import { countrieDto } from '../countries/countrie.dto';
import { SkiperWalletDto } from '../skiper-wallet/skiper-wallet.dto';

@InputType()
export class CurrencyInput {
    id: number;
    name: string;
    idcountry: number;
    isCrypto: Boolean;
    iso: string;
    url_img: string;
}

@ObjectType()
export class CurrencyDto {
    id: number;
    name: string;
    idcountry: number;
    isCrypto: Boolean;
    iso: string;
    url_img: string;
    country: countrieDto;
}

@ObjectType()
export class CurrencyWhitWalletDto {
    id: number;
    name: string;
    idcountry: number;
    isCrypto: Boolean;
    iso: string;
    url_img: string;
    country: countrieDto;
    skiperwallet: SkiperWalletDto;
}