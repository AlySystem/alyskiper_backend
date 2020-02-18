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

    @Mutation()
    async RegisterUserWallet(@Args('input') input: UserWalletAddressInput) {
        return this.service.create(input);
    }
    @Mutation()
    async UpdateUserWallet(@Args('id') id: number) {
        return this.service.update(id);
    }
}
