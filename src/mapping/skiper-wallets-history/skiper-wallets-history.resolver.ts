import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { SkiperWalletsHistoryService } from './skiper-wallets-history.service';
import { ParseIntPipe } from '@nestjs/common';
import { SkiperWalletsHistoryInput } from './skiper-wallets-history.dto';

@Resolver('SkiperWalletsHistory')
export class SkiperWalletsHistoryResolver {
    constructor(
        private readonly skiperWalletHistoryService: SkiperWalletsHistoryService
    ) { }

    @Query('SkiperWalletsHistory')
    async SkiperWalletsHistory() {
        return await this.skiperWalletHistoryService.getAll();
    }

    @Query()
    async searchSkiperWalletHistory(@Args('id', ParseIntPipe) id: number) {
        return this.skiperWalletHistoryService.getById(id);
    }

    @Query()
    getGanaciaDelDia(
        @Args('idwallet') idwallet: number,
        @Args('lat') lat: number,
        @Args('lng') lng: number,
        @Args('flat') flat: boolean = false
    ) {
        return this.skiperWalletHistoryService.getGanaciaDelDia(idwallet, lat, lng, flat);
    }

    @Query()
    getBalanceEnabled(@Args('idwallet') idwallet: number, @Args('lat') lat: number, @Args('long') long: number) {
        return this.skiperWalletHistoryService.getSaldoHabilitado(idwallet, lat, long);
    }

    @Mutation()
    registerSkiperWalletHistory(@Args('input') input: SkiperWalletsHistoryInput) {
        return this.skiperWalletHistoryService.registerSkiperWalletHistory(input);
    }

    @Mutation()
    async WithdrawalToInternalWallet(@Args('walletId') walletId: number, @Args('amount') amount: number) {
        return await this.skiperWalletHistoryService.WithdrawalToInternalWallet(walletId, amount);
    }

    @Mutation()
    async TransferToOtherUser(
        @Args('emailTo') emailTo: string,
        @Args('walletId') walletId: number,
        @Args('amount') amount: number,
        @Args('isoTo') isoTo: string = "",
        @Args('lat') lat: number,
        @Args('long') long: number) {
        return await this.skiperWalletHistoryService.TransferToOtherUser(emailTo, walletId, amount, isoTo, lat, long);
    }

    @Mutation()
    async withdrawalToExternalWallet(
        @Args('walletId') walletId: number,
        @Args('userwalletAddressId') userwalletAddressId: number
    ) {
        return this.skiperWalletHistoryService.withdrawalToExternalWallet(walletId, userwalletAddressId)
    }
}
