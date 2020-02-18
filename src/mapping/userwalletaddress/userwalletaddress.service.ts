import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserWalletAddress } from './userwalletaddress.entity';
import { Repository } from 'typeorm';
import { UserWalletAddressInput } from './userwalletaddress.dto';
import { UserService } from '../users/user.service';
import { PaymentMethodsService } from '../payment-methods/payment-methods.service';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class UserwalletaddressService {
    constructor(
        @InjectRepository(UserWalletAddress) private readonly repository: Repository<UserWalletAddress>,
        private readonly userRepository: UserService,
        private readonly paymentMethodRepository: PaymentMethodsService,
        private readonly currencyRepository: CurrencyService
    ) { }
    async getAll(): Promise<UserWalletAddress[]> {
        return await this.repository.find();
    }

    async getById(id: number): Promise<UserWalletAddress> {
        return await this.repository.findOne(id);
    }

    async create(input: UserWalletAddressInput): Promise<UserWalletAddress> {
        let user = await this.userRepository.getUserById(input.userId);
        let paymentMethod = await this.paymentMethodRepository.getById(input.paymentId);
        let currency = await this.currencyRepository.getById(input.currencyId);
        let parse = this.parseUserWalletAddress(input, user, paymentMethod, currency);
        return this.repository.save(parse);
    }

    async update(input: UserWalletAddressInput): Promise<UserWalletAddress> {
        let searchUserWallet = await this.getById(input.id);
        if (searchUserWallet != undefined) {
            let user = await this.userRepository.getUserById(searchUserWallet.userId);
            let paymentMethod = await this.paymentMethodRepository.getById(searchUserWallet.paymentId);
            let currency = await this.currencyRepository.getById(searchUserWallet.currencyId);
            let parse = this.parseUserWalletAddress(input, user, paymentMethod, currency);
            console.log(parse)
            return this.repository.save(parse);
        } else {
            throw new HttpException(
                'Error transaction',
                HttpStatus.BAD_REQUEST
            );
        }

    }

    private parseUserWalletAddress(input: UserWalletAddressInput, user?, paymentMethod?, currency?): UserWalletAddress {
        let userwalletAddress: UserWalletAddress = new UserWalletAddress();
        userwalletAddress.id = input.id;
        userwalletAddress.payaddress = input.payaddress;
        userwalletAddress.platformName = input.platformName;
        userwalletAddress.currency = currency;
        userwalletAddress.user = user;
        userwalletAddress.paymentMethod = paymentMethod;
        return userwalletAddress;
    }
}
