import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UserwalletaddressService } from './userwalletaddress.service';
import { UserWalletAddressInput } from './userwalletaddress.dto';


@Resolver('Userwalletaddress')
export class UserwalletaddressResolver {
    constructor(
        private readonly service: UserwalletaddressService
    ) { }

    @Query()
    async getUserWallet() {
        return this.service.getAll();
    }

    @Query()
    async getUserWalletById(@Args('id') id: number) {
        return this.service.getById(id);
    }

    @Query()
    async getPaymentWithdrawalMethodByUserId(
        @Args('userId') userId: number
    ) {
        return this.service.getPaymentWithdrawalMethodByUserId(userId)
    }

    @Mutation()
    async RegisterUserWallet(
        @Args('input') input: UserWalletAddressInput,
        @Args('lat') lat: number,
        @Args('long') long: number) {
        return this.service.create(input, lat, long);
    }
    @Mutation()
    async DeleteUserWallet(@Args('id') id:number) {
        return this.service.delete(id);
    }
}
