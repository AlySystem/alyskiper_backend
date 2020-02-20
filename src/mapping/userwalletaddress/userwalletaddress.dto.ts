import { InputType } from "type-graphql";
import { UserDto } from '../users/user.dto';
import { PaymentMethodDto } from '../payment-methods/payment-methods.dto';
import { CurrencyDto } from '../currency/currency.dto';


@InputType()
export class UserWalletAddressInput {
    id: number;
    payaddress: string;
    platformName: string;
    userId: number;
    currencyId: number;
    paymentId:number;
}

@InputType()
export class UserWalletAddressDto {
    id: number;
    payaddress: string;
    platformName: string;
    user: UserDto;
    currency: CurrencyDto;
    paymentMethod: PaymentMethodDto;
}