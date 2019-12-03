import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { SkiperWallet } from './skiper-wallet.entity';
import { SkiperWalletInput } from './skiper-wallet.dto';
import { SkiperWalletsHistory } from '../skiper-wallets-history/skiper-wallets-history.entity';
import { TransactionType } from '../transaction-type/transaction-type.entity';

@Injectable()
export class SkiperWalletService {
    constructor(
        @InjectRepository(SkiperWallet)
        private readonly repository: Repository<SkiperWallet>
    ) { }

    async getAll(): Promise<SkiperWallet[]> {
        return await this.repository.find({ relations: ["userID", "currencyID", "countryID"] });
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
            result = await this.repository.save(result);
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

    async getSaldoHabilitado(idwallet: number) {
        
    }

    async registerDeposit(id: number, idtransaction: number, idpayment_method: number, deposit: number) {
        try {
            let wallet = await this.repository.findOneOrFail({ id });
            let result = await this.walletDepositTransaction(wallet, deposit, idtransaction, idpayment_method);
            if (result) {
                return await this.getById(result.id);
            }
            return result;
        } catch (error) {
            throw new HttpException('La wallet a buscar no existe', HttpStatus.BAD_REQUEST);
        }
    }

    private async walletDepositTransaction(wallet: SkiperWallet, deposit: number, idtransaction: number, idpayment_method: number): Promise<SkiperWallet> {
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
            walletHistory.description = "Deposito Inicial de la billetera";
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