import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { SkiperWalletService } from './skiper-wallet.service';
import { ParseIntPipe } from '@nestjs/common';
import { SkiperWalletInput, SkiperWalletCreateInput } from './skiper-wallet.dto';
require('isomorphic-fetch');

@Resolver('SkiperWallet')
export class SkiperWalletResolver {
    constructor(private readonly skiperWalletService: SkiperWalletService) { }

    @Query()
    async skiperwallets() {
        return this.skiperWalletService.getAll();
    }

    @Query()
    async getAmountByCrypto(@Args('crypto') crypto: number,
        @Args('concept') concept: number,
        @Args('amount') amount: number,
        @Args('iduser') iduser: number,
        @Args('idcountry') idcountry: number,
        @Args('idpackage') idpackage: number) {
        return this.skiperWalletService.getAmountByCrypto(crypto, concept, amount, iduser, idcountry, idpackage);
    }


    @Query()
    getAllSkiperWalletsByUserId(@Args('iduser') iduser: number) {
        return this.skiperWalletService.getAllByUserId(iduser);
    }

    @Query()
    async searchSkiperWallet(@Args('id', ParseIntPipe) id: number) {
        return this.skiperWalletService.getById(id);
    }

    @Query()
    convertBalance(@Args('amount') amount: number, @Args('isoCrypto') isoCrypto: string, @Args('lat') lat: number, @Args('long') long: number) {
        return this.skiperWalletService.convertBalance(amount, isoCrypto, lat, long);
    }

    @Mutation()
    registerSkiperCryptoWallet(@Args('input') input: SkiperWalletCreateInput) {
        return this.skiperWalletService.registerSkiperCryptowallet(input);
    }
    @Mutation()
    registerSkiperLocalWallet(@Args('input') input: SkiperWalletCreateInput) {
        return this.skiperWalletService.registerSkiperLocalwallet(input);
    }
    @Mutation()
    validateHash(
        @Args('hash') hash: string,
        @Args('lat') lat: number,
        @Args('long') long: number,
        @Args('packageId') packageId: number,
        @Args('userId') userId: number,
        @Args('email') email: string,
        @Args('invoice') invoice: number,
        @Args('is_user') is_user: boolean = false) {
        return this.skiperWalletService.validateHash(hash, invoice, lat, long, packageId, userId, email, is_user);
    }

    @Mutation()
    validateHashBuyAlycoin(
        @Args('hash') hash: string,
        @Args('invoice') invoice: number,
        @Args('lat') lat: number,
        @Args('long') long: number,
        @Args('packageId') packageId: number,
        @Args('userId') userId: number,
        @Args('walletAly') walletAly: string) {
        return this.skiperWalletService.validateHashBuyAlycoin(hash, invoice, lat, long, packageId, userId, walletAly);
    }

    @Mutation()
    registerDepositWallet(
        @Args('idwallet') idwallet: number,
        @Args('idtransaction') idtransaction: number,
        @Args('idpayment_method') idpayment_method: number,
        @Args('deposit') deposit: number,
        @Args('depositCrypto') depositCrypto: number,
        @Args('description') description: string,
        @Args('is_user') is_user: boolean = false) {
        return this.skiperWalletService.registerDeposit(idwallet, idtransaction, idpayment_method, deposit, depositCrypto, is_user, description);
    }

    @Mutation()
    requestWithdrawalOrTransactionReversed(
        @Args('idwallet') idwallet: number,
        @Args('idtransaction') idtransaction: number,
        @Args('idpayment_method') idpayment_method: number,
        @Args('amount') amount: number,
        @Args('description') description) {
        return this.skiperWalletService.requestWithdrawals(idwallet, idtransaction, idpayment_method, amount, description);
    }

    @Mutation()
    async updateSkiperWallet(@Args('input') input: SkiperWalletInput) {
        try {
            return await this.skiperWalletService.updateSkiperWallet(input);
        } catch (error) {
            console.error(error);
        }
    }
}
