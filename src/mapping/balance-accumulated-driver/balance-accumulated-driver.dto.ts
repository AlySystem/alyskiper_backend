import { InputType, ObjectType } from 'type-graphql';

@InputType()
export class BalanceAccumulatedDriverInput {
    id: number;
    userId: number;
    walletId: number;
    currencyId: number;
}

@ObjectType()
export class BalanceAccumulatedDriverDto {
    id: number;
    userId: number;
    walletId: number;
    currencyId: number;
}