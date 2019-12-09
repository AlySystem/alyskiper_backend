import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { SkiperWalletService } from './skiper-wallet.service';
import { ParseIntPipe } from '@nestjs/common';
import { SkiperWalletInput } from './skiper-wallet.dto';
require('isomorphic-fetch');

@Resolver('SkiperWallet')
export class SkiperWalletResolver {
    constructor(private readonly skiperWalletService: SkiperWalletService) { }

    @Query()
    async skiperwallets() {
        return this.skiperWalletService.getAll();
    }

    @Query()
    async getAmountByCrypto(@Args('crypto') crypto: string,
        @Args('amount') amount: number,
        @Args('iduser') iduser: number,
        @Args('idcountry') idcountry: number,
        @Args('idpackage') idpackage: number) {
        return this.skiperWalletService.getAmountByCrypto(crypto, amount, iduser, idcountry, idpackage);
    }


    @Query()
    getAllSkiperWalletsByUserId(@Args('iduser') iduser: number) {
        return this.skiperWalletService.getAllByUserId(iduser);
    }

    @Query()
    async searchSkiperWallet(@Args('id', ParseIntPipe) id: number) {
        return this.skiperWalletService.getById(id);
    }

    @Mutation()
    registerSkiperWallet(@Args('input') input: SkiperWalletInput) {
        try {
            return this.skiperWalletService.registerSkiperwallet(input);
        } catch (error) {
            console.error(error);
        }
    }
    @Mutation()
    validateHash(@Args('hash') hash: string, @Args('crypto') crypto: string, @Args('total') total: number) {
        return this.skiperWalletService.validateHash(hash, crypto, total);
    }

    @Mutation()
    registerDepositWallet(
        @Args('idwallet') idwallet: number,
        @Args('idtransaction') idtransaction: number,
        @Args('idpayment_method') idpayment_method: number,
        @Args('deposit') deposit: number,
        @Args('description') description) {
        return this.skiperWalletService.registerDeposit(idwallet, idtransaction, idpayment_method, deposit, description);
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
