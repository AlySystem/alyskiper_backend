import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection, createQueryBuilder } from 'typeorm';
import { SkiperWallet } from './skiper-wallet.entity';
import { SkiperWalletInput } from './skiper-wallet.dto';
import { SkiperWalletsHistory } from '../skiper-wallets-history/skiper-wallets-history.entity';
import { TransactionType } from '../transaction-type/transaction-type.entity';
import { WalletscompaniesService } from "../walletscompanies/walletscompanies.service";
import { AlycoinInvoices } from '../alycoin-invoices/alycoin-invoices.entity';
import { DetailAlycoinIinvoice } from '../detail-alycoin-invoice/detail-alycoin-invoice.entity';
import { UserService } from '../users/user.service';
import { User } from '../users/user.entity';

@Injectable()
export class SkiperWalletService {
    constructor(
        @InjectRepository(SkiperWallet)
        private readonly repository: Repository<SkiperWallet>,
        private readonly walletservice: WalletscompaniesService,
        private readonly userservice: UserService
    ) { }

    async getAll(): Promise<SkiperWallet[]> {
        return await this.repository.find({ relations: ["userID", "currencyID", "countryID"] });
    }

    async getAmountByCrypto(crypto: string, amount: number, iduser: number, idcountry: number, idpackage: number) {
        try {
            const url = `https://api.coinmarketcap.com/v1/ticker/${crypto}/`;
            var cryptodate = await fetch(url)
                .then(response => response.json())
                .then(json => {
                    return json;
                });

            let Price_usd = parseFloat(cryptodate[0].price_usd);
            let numfact = await this.CreateInvoice(iduser, idcountry, idpackage, amount);
            let user = await this.userservice.getUserById(numfact.iduser);
            let walletcompanies = await this.walletservice.getWalletByCrypto(crypto)
            let amountpay = (amount / Price_usd).toFixed(8)
            let datasend = {
                numberFact: numfact.numfac,
                nameUser: `${user.firstname} ${user.lastname}`,
                state: false,
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

    private async CreateInvoice(iduser: number, idcountry: number, idpackage: number, amount: number): Promise<AlycoinInvoices> {
        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();
        let result;
        let alycoininvoice = new AlycoinInvoices();
        let detailalycoininvoice = new DetailAlycoinIinvoice();
        await queryRunner.startTransaction();
        try {
            let response = await createQueryBuilder(AlycoinInvoices, "AlycoinInvoices")
                .addOrderBy('AlycoinInvoices.id', 'DESC')
                .limit(1)
                .getOne();
            if (response != undefined) {
                alycoininvoice.numfac = response.numfac + 1;
            } else {
                alycoininvoice.numfac = 1;
            }
            alycoininvoice.iduser = iduser;
            alycoininvoice.idcountry = idcountry;
            alycoininvoice.date_in = new Date();
            result = await queryRunner.manager.save(alycoininvoice);

            detailalycoininvoice.idinvoice = result.id;
            detailalycoininvoice.idpackage = idpackage;
            detailalycoininvoice.total = amount;
            await queryRunner.manager.save(detailalycoininvoice);

            await queryRunner.commitTransaction();

        } catch (error) {
            await queryRunner.rollbackTransaction();
        } finally {
            queryRunner.release();
            return result;
        }


    }

    async validateHash(hash: string, crypto: string, total: number) {
        let wallet = await this.walletservice.getWalletByCrypto(crypto);
        let arraymi = new Array();
        switch (crypto) {
            case 'bitcoin':
                let url = `https://api.blockcypher.com/v1/btc/main/txs/${hash}`;
                let cryptodate = await fetch(url)
                    .then(response => response.json())
                    .then(json => {
                        return json;
                    });
                if (!cryptodate.error) {
                    cryptodate.outputs.forEach(output => {
                        arraymi.push((((parseFloat(output.value) * 0.00000001).toFixed(8)).toString()))
                    })

                    if (cryptodate.addresses.includes(wallet.txt)) {
                        if (arraymi.includes(total.toString())) {
                            return 'exito'
                        } else {
                            return "you did not send the amount necessary to accept your transaction";
                        }
                    } else {
                        return "We have not found our wallet in your transaction";
                    }

                } else {
                    return "wrong hash check and try again"
                }
                break
            case 'dash':
                const url2 = `https://api.blockcypher.com/v1/dash/main/txs/${hash}`;
                let cryptodate2 = await fetch(url2)
                    .then(response => response.json())
                    .then(json => {
                        return json;
                    });
                if (!cryptodate2.error) {
                    cryptodate2.outputs.forEach(output => {
                        arraymi.push((((parseFloat(output.value) * 0.00000001).toFixed(8)).toString()))
                    })

                    if (cryptodate2.addresses.includes(wallet.txt)) {
                        if (arraymi.includes(total.toString())) {
                            return 'exito'
                        } else {
                            return "you did not send the amount necessary to accept your transaction";
                        }
                    } else {
                        return "We have not found our wallet in your transaction";
                    }

                } else {
                    return "wrong hash check and try again"
                }
                break
            case 'litecoin':
                const url3 = `https://api.blockcypher.com/v1/ltc/main/txs/${hash}`;
                let cryptodate3 = await fetch(url3)
                    .then(response => response.json())
                    .then(json => {
                        return json;
                    });
                if (!cryptodate3.error) {
                    cryptodate3.outputs.forEach(output => {
                        arraymi.push((((parseFloat(output.value) * 0.00000001).toFixed(8)).toString()))
                    })

                    if (cryptodate3.addresses.includes(wallet.txt)) {
                        if (arraymi.includes(total.toString())) {
                            return 'exito'
                        } else {
                            return "you did not send the amount necessary to accept your transaction";
                        }
                    } else {
                        return "We have not found our wallet in your transaction";
                    }

                } else {
                    return "wrong hash check and try again"
                }
                break
            case 'ethereum':
                const url4 = `https://api.blockcypher.com/v1/ltc/main/txs/${hash}`;
                let cryptodate4 = await fetch(url4)
                    .then(response => response.json())
                    .then(json => {
                        return json;
                    });
                if (!cryptodate4.error) {
                    cryptodate4.outputs.forEach(output => {
                        arraymi.push((((parseFloat(output.value) * 0.000000000000000001).toFixed(8)).toString()))
                    })
                    var wcompanystring = wallet.txt
                    var wcompay = wcompanystring.substr(2);
                    if (cryptodate4.addresses.includes(wcompay.toLowerCase())) {
                        if (arraymi.includes(total.toString())) {
                            return 'exito'
                        } else {
                            return "you did not send the amount necessary to accept your transaction";
                        }
                    } else {
                        return "We have not found our wallet in your transaction";
                    }

                } else {
                    return "wrong hash check and try again"
                }
                break
            default:
                return "select an available method"
        }

    }

    async getAllByUserId(id: number): Promise<SkiperWallet[]> {
        return await this.repository.find({ relations: ["userID", "currencyID", "countryID"], where: { iduser: id } });
    }

    async getById(id: number): Promise<SkiperWallet> {
        try {
            let result = await this.repository.findOne(
                {
                    relations: ["userID", "currencyID", "countryID"],
                    where: { id }
                }
            );
            return result;
        } catch (error) {
            const errorMessage = error.error_message || 'Error in the request';
            throw new HttpException(
                errorMessage,
                HttpStatus.BAD_REQUEST
            )
        }
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