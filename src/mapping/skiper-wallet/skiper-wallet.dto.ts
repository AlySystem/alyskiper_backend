import { InputType, ObjectType } from 'type-graphql';
import { UserDto } from '../users/user.dto';
import { CurrencyDto } from '../currency/currency.dto';
import { countrieDto } from '../countries/countrie.dto';

@InputType()
export class SkiperWalletInput {
    id: number;
    iduser: number;
    amount: number;
    idcurrency: number;
    idcountry: number;
    minimun: number;
    bretirar: boolean;
    date_in: Date;
}

@ObjectType()
export class SendDataForPayCrypto {
    crypto: string;
    company: string;
    walletReceive: string;
    amounSend: number;
}

@ObjectType()
export class SkiperWalletDto {
    id: number;
    amount: number;
    minimun: number;
    bretirar: boolean;
    date_in: Date;
    userID: UserDto;
    currencyID: CurrencyDto;
    countryID: countrieDto;
}