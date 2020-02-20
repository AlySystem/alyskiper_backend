import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserWalletAddress } from './userwalletaddress.entity';
import { Repository, QueryBuilder, createQueryBuilder } from 'typeorm';
import { UserWalletAddressInput } from './userwalletaddress.dto';
import { UserService } from '../users/user.service';
import { PaymentMethodsService } from '../payment-methods/payment-methods.service';
import { PaymentMethods } from '../payment-methods/payment-methods.entity';
import { CurrencyService } from '../currency/currency.service';
import node_geocoder from 'node-geocoder';
import { Currency } from '../currency/currency.entity';

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

    async getPaymentWithdrawalMethodByUserId(userId: number): Promise<UserWalletAddress[]> {
        return await this.repository.find({
            relations: ['user', 'currency', 'paymentMethod'],
            where: {
                userId: userId
            }
        });
    }

    async create(input: UserWalletAddressInput, lat: number, lng: number): Promise<boolean> {
        let validateCurrency = await this.currencyRepository.getById(input.currencyId);
        if (validateCurrency.isCrypto) {
            let user = await this.userRepository.getUserById(input.userId);
            let ifExistToRefuse = await this.repository.findOne({ where: { currency: validateCurrency, userId: user.id } });
            if (ifExistToRefuse == undefined) {
                let paymentMethod = await createQueryBuilder(PaymentMethods, "PaymentMethods")
                    .where("PaymentMethods.name = :name", { name: "AlyPay" }).getOne();
                let parse = this.parseUserWalletAddress(input, user, paymentMethod, validateCurrency);
                let result = this.repository.save(parse);
                if (result) {
                    return true
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            let options = {
                provider: 'google',
                httpAdapter: 'https', // Default
                apiKey: 'AIzaSyDJqxifvNO50af0t6Y9gaPCJ8hYtkbOmQ8', // for Mapquest, OpenCage, Google Premier
                formatter: 'json' // 'gpx', 'string', ...
            };
            let geocoder = node_geocoder(options);
            let dateCountry = await geocoder.reverse({ lat: lat, lon: lng });
            let ifLocalcurrency = await createQueryBuilder(Currency, "Currency")
                .innerJoinAndSelect("Currency.country", "country")
                .andWhere("country.name = :name", { name: String(dateCountry[0].country).toUpperCase() }).getOne();
            if (ifLocalcurrency.country.name.toString() == validateCurrency.country.name.toString()) {
                let user = await this.userRepository.getUserById(input.userId);
                let ifExistToRefuse = await this.repository.findOne({ where: { currency: ifLocalcurrency, userId: user.id } });
                if (ifExistToRefuse == undefined) {
                    let paymentMethod = await createQueryBuilder(PaymentMethods, "PaymentMethods")
                        .where("PaymentMethods.name = :name", { name: "Banco" }).getOne();
                    let parse = this.parseUserWalletAddress(input, user, paymentMethod, ifLocalcurrency);
                    let result = this.repository.save(parse);
                    if (result) {
                        return true
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }

            } else {
                return false;
            }
        }
    }


    async delete(id: number): Promise<boolean> {
        let searchUserWallet = await this.getById(id);
        if (searchUserWallet != undefined) {
            let result = this.repository.remove(searchUserWallet);
            if (result) {
                return true;
            } else {
                return false;
            }
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
