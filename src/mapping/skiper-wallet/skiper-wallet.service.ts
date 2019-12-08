import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { SkiperWallet } from './skiper-wallet.entity';
import { SkiperWalletInput } from './skiper-wallet.dto';
import { SkiperWalletsHistory } from '../skiper-wallets-history/skiper-wallets-history.entity';
import { TransactionType } from '../transaction-type/transaction-type.entity';
import { WalletscompaniesService } from "../walletscompanies/walletscompanies.service";

@Injectable()
export class SkiperWalletService {
    constructor(
        @InjectRepository(SkiperWallet)
        private readonly repository: Repository<SkiperWallet>,
        private readonly walletservice: WalletscompaniesService
    ) { }

    async getAll(): Promise<SkiperWallet[]> {
        return await this.repository.find({ relations: ["userID", "currencyID", "countryID"] });
    }

    async getAmountByCrypto(crypto: string, amount: number) {
        try {
            const url = `https://api.coinmarketcap.com/v1/ticker/${crypto}/`;
            var cryptodate = await fetch(url)
                .then(response => response.json())
                .then(json => {
                    return json;
                });

            let Price_usd = parseFloat(cryptodate[0].price_usd);
            let walletcompanies = await this.walletservice.getWalletByCrypto(crypto)
            let amountpay = (amount / Price_usd).toFixed(8)
            let datasend = {
                crypto: walletcompanies.identifier,
                company: walletcompanies.name_company,
                walletReceive: walletcompanies.txt,
                amounSend: amountpay
            };
            return datasend;
        } catch (error) {
            console.log(error)
        }
    }

    async getAllByUserId(id: number): Promise<SkiperWallet[]> {
        return await this.repository.find({ relations: ["userID", "currencyID", "countryID"], where: { iduser: id } });
    }

    async getById(id: number): Promise<SkiperWallet> {
        return await this.repository.findOne(
            {
                relations: ["userID", "currencyID", "countryID"],
                where: { id }
            }
        );
    }

    async registerSkiperwallet(input: SkiperWalletInput) {
        try {
            let result = this.parseSkiperWallet(input);
            let searchWallet = await this.getAllByUserId(input.iduser);
            console.log(searchWallet.length)
            if (!searchWallet.length) {
                result = await this.repository.save(result);
                return result;
            }
            return result;

        } catch (error) {
            console.error(error);
            throw new HttpException('Error al registrar la wallet', HttpStatus.NOT_FOUND)
        }
    }

    async updateSkiperWallet(input: SkiperWalletInput) {
        try {
            let result = await this.getById(input.id);
            if (result) {
                result.iduser = input.iduser;
                result.idcountry = input.idcountry;
                result.idcurrency = input.idcurrency;
                result.amount = input.amount;
                result.date_in = input.date_in;
                return await this.repository.save(result);
            }
        } catch (error) {
            console.error(error);
        }
    }


    async registerDeposit(id: number, idtransaction: number, idpayment_method: number, deposit: number, description: string) {
        try {
            let wallet = await this.repository.findOneOrFail({ id });
            let result = await this.walletDepositTransaction(wallet, deposit, idtransaction, idpayment_method, description);
            if (result) {
                return await this.getById(result.id);
            }
            return result;
        } catch (error) {
            throw new HttpException('La wallet a buscar no existe', HttpStatus.BAD_REQUEST);
        }
    }

    private async walletDepositTransaction(wallet: SkiperWallet, deposit: number, idtransaction: number, idpayment_method: number, description: string): Promise<SkiperWallet> {
        let connection = getConnection();
        let queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        let result;
        let walletHistory = new SkiperWalletsHistory();
        try {
            let transacionType = await queryRunner.manager.findOneOrFail(TransactionType, { where: { id: idtransaction } });
            walletHistory.amount = deposit * transacionType.sign;
            walletHistory.idcurrency = wallet.idcurrency;
            walletHistory.idskiperwallet = wallet.id;
            walletHistory.idpayment_methods = idpayment_method;
            walletHistory.description = description;
            walletHistory.idtransactiontype = idtransaction;
            walletHistory.date_in = new Date();
            //Save entity
            wallet.amount = (parseFloat(walletHistory.amount.toString()) + parseFloat(wallet.amount.toString()));
            result = await queryRunner.manager.save(wallet);
            await queryRunner.manager.save(walletHistory);
            await queryRunner.commitTransaction();
        } catch (err) {
            console.log(err);
            await queryRunner.rollbackTransaction();
            return null;
        } finally {
            await queryRunner.release();
            return result;
        }
    }

    private parseSkiperWallet(input: SkiperWalletInput): SkiperWallet {
        let skiperwallet: SkiperWallet = new SkiperWallet();
        skiperwallet.iduser = input.iduser;
        skiperwallet.amount = input.amount;
        skiperwallet.idcountry = input.idcountry;
        skiperwallet.date_in = input.date_in;
        skiperwallet.idcurrency = input.idcurrency;
        skiperwallet.date_in = input.date_in;
        skiperwallet.minimun = input.minimun;
        skiperwallet.bretirar = input.bretirar;
        return skiperwallet;
    }
}