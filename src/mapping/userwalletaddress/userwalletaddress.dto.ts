import { InputType } from "type-graphql";
import { UserDto } from '../users/user.dto';
import { PaymentMethodDto } from '../payment-methods/payment-methods.dto';
import {CurrencyDto} from '../currency/currency.dto';


@InputType()
export class UserWalletAddressInput {
    id: number;
    payaddress:string;
    userId: number;
    paymentId: number;
    currencyId:number;      
}

@InputType()
export class UserWalletAddressDto {
    id: number;
    payaddress:string;
    user: UserDto;
    paymentMethod: PaymentMethodDto;
    currency:CurrencyDto;
}