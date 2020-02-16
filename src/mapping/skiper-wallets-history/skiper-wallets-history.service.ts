import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SkiperWalletsHistory } from './skiper-wallets-history.entity';
import { Repository, createQueryBuilder, getConnection } from 'typeorm';
import { SkiperWalletsHistoryInput } from './skiper-wallets-history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import geotz from 'geo-tz';
import momentTimeZone from 'moment-timezone';
import { ExchangeRate } from '../exchange-rate/exchange-rate.entity';
import node_geocoder from 'node-geocoder';
import { SkiperWallet } from '../skiper-wallet/skiper-wallet.entity';
import { SkiperWalletService } from '../skiper-wallet/skiper-wallet.service';
import { TransactionType } from '../transaction-type/transaction-type.entity';
import { PaymentMethods } from '../payment-methods/payment-methods.entity';

const rp = require('request-promise');

@Injectable()
export class SkiperWalletsHistoryService {
    constructor(
        @InjectRepository(SkiperWalletsHistory)
        private readonly repository: Repository<SkiperWalletsHistory>,
        private readonly walletservice: SkiperWalletService
    ) { }

    async TransferToOtherUser(emailTo: string, walletId: number, amount: number, iso: string, lat: number, long: number) {
        let wallet = await this.walletservice.getById(walletId);
        let walletTo = await this.getWalletsByEmailUser(emailTo, iso.toUpperCase())
        let amoutConverted;
        if (wallet == undefined) {
            throw new HttpException(
                "wallet not exist!",
                HttpStatus.BAD_REQUEST,
            );
        }
        if (walletTo == undefined) {
            throw new HttpException(
                "wallet to transfer not exist!",
                HttpStatus.BAD_REQUEST,
            );
        }
        if (wallet.currencyID.isCrypto) {
            var options = {
                provider: 'google',
                httpAdapter: 'https', // Default
                apiKey: 'AIzaSyDJqxifvNO50af0t6Y9gaPCJ8hYtkbOmQ8', // for Mapquest, OpenCage, Google Premier
                formatter: 'json' // 'gpx', 'string', ...
            };
            var geocoder = node_geocoder(options);
            let zonahoraria = geotz(lat, long)
            let date = momentTimeZone().tz(zonahoraria.toString()).format("YYYY-MM-DD")
            var datecountry = await geocoder.reverse({ lat: lat, lon: long });
            const requestOptions = {
                method: 'GET',
                uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
                qs: {
                    'symbol': `${iso.toUpperCase()}`
                },
                headers: {
                    'X-CMC_PRO_API_KEY': 'f78fa793-b95e-4a58-a0ef-760f070defb0'
                },
                json: true,
                gzip: true
            };
            let exchangeUSD = await this.getExchange(datecountry[0].country, date);
            let validateValue = (exchangeUSD != undefined && exchangeUSD.value != null) ? exchangeUSD.value : 0;
            amoutConverted = await rp(requestOptions).then(result => {
                let amoutUsd = (amount / validateValue);
                let priceCryptoUsd = parseFloat(result.data[`${iso.toUpperCase()}`].quote.USD.price.toFixed(2));
                let amountCrypto = (parseFloat(amoutUsd.toFixed(2)) / priceCryptoUsd)
                return amountCrypto.toFixed(8);
            })
        } else {
            amoutConverted = amount;
        }

        return this.ExecuteTransfer(wallet, walletTo, amoutConverted, amount);
    }
    private async ExecuteTransfer(wallet: SkiperWallet, walletTo: SkiperWallet, amoutConverted: number, amount: number) {
        let connection = getConnection();
        let queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let result;
        let totalPaid = await createQueryBuilder("SkiperWalletsHistory")
            .innerJoin("SkiperWalletsHistory.transactiontype", "TransactionType")
            .innerJoin("SkiperWalletsHistory.paymentmethod", "paymentmethod")
            .select(`IFNULL(ROUND(
                SUM(CASE WHEN TransactionType.code = 'CR' AND paymentmethod.name = 'AlyPay'  THEN  SkiperWalletsHistory.amount ELSE 0 END) - 
                SUM(CASE WHEN TransactionType.code = 'DB'  THEN  SkiperWalletsHistory.amount ELSE 0 END) -
                SUM(CASE WHEN TransactionType.code = 'DV'  THEN  SkiperWalletsHistory.amount ELSE 0 END) -
                SUM(CASE WHEN TransactionType.code = 'RT'  THEN  SkiperWalletsHistory.amount ELSE 0 END),2),0)  balance`)
            .where("SkiperWalletsHistory.idskiperwallet = :wallet", { wallet: wallet.id })
            .getRawOne();

        let transferencia = await queryRunner.manager.findOne(TransactionType, { where: { code: 'TF' } });
        let debito = await queryRunner.manager.findOne(TransactionType, { where: { code: 'DB' } });
        let paymentMethod = await queryRunner.manager.findOne(PaymentMethods, { where: { name: 'AlyPay', active: true } });
        // let walletFrom = await queryRunner.manager.findOne(SkiperWallet, { where: { id: wallet.id } });
        // let walletT = await queryRunner.manager.findOne(SkiperWallet, { relations:[], where: { id: walletTo.id } });
        let amountPlusfees = amount + (amount * transferencia.fees) / 100;

        if (totalPaid.balance == 0) {
            throw new HttpException(
                "you have no withdrawal balance",
                HttpStatus.FORBIDDEN,
            );
        }
        if (totalPaid.balance < amountPlusfees) {
            throw new HttpException(
                "your funds are not enough",
                HttpStatus.FORBIDDEN
            )
        }
        try {
            let registeWalletsHistoryTransfer = new SkiperWalletsHistory();
            registeWalletsHistoryTransfer.amount = amount;
            registeWalletsHistoryTransfer.idcurrency = wallet.idcurrency;
            registeWalletsHistoryTransfer.idskiperwallet = wallet.id;
            registeWalletsHistoryTransfer.idpayment_methods = paymentMethod.id;
            registeWalletsHistoryTransfer.description = 'Retiro a Balance Interno AlyPay';
            registeWalletsHistoryTransfer.idtransactiontype = debito.id;
            registeWalletsHistoryTransfer.date_in = new Date();
            let walletHistory = await queryRunner.manager.save(registeWalletsHistoryTransfer)

            let registerFeeWalletHistoryTransfer = new SkiperWalletsHistory();
            let fees = (amount * transferencia.fees) / 100;
            registerFeeWalletHistoryTransfer.amount = Number(fees.toFixed(2));
            registerFeeWalletHistoryTransfer.idcurrency = wallet.idcurrency;
            registerFeeWalletHistoryTransfer.idskiperwallet = wallet.id;
            registerFeeWalletHistoryTransfer.idpayment_methods = paymentMethod.id;
            registerFeeWalletHistoryTransfer.description = 'Comisión por servicio Alypay';
            registerFeeWalletHistoryTransfer.idtransactiontype = debito.id;
            registerFeeWalletHistoryTransfer.date_in = new Date();
            await queryRunner.manager.save(registerFeeWalletHistoryTransfer);

            //actualizo la wallet del usaurio que recibio   

            if (walletTo.currencyID.isCrypto) {
                walletTo.amount_crypto = parseFloat(walletTo.amount_crypto.toString()) + amoutConverted;
                result = await queryRunner.manager.save(walletTo);
            } else {
                walletTo.amount = parseFloat(walletTo.amount.toString()) + amount;
                result = await queryRunner.manager.save(walletTo);
            }
            //aqui realizo el registro al historial de la transferencia del usuario que recibio
            let registerReferenceTransactionWalletHistoryTransfer = new SkiperWalletsHistory();
            if (walletTo.currencyID.isCrypto) {
                registerReferenceTransactionWalletHistoryTransfer.amount_crypto = amoutConverted;
            } else {
                registerReferenceTransactionWalletHistoryTransfer.amount = amount;
            }
            registerReferenceTransactionWalletHistoryTransfer.idcurrency = walletTo.idcurrency;
            registerReferenceTransactionWalletHistoryTransfer.idskiperwallet = walletTo.id;
            registerReferenceTransactionWalletHistoryTransfer.idpayment_methods = paymentMethod.id;
            registerReferenceTransactionWalletHistoryTransfer.description = `Transferencia recibida de: ${wallet.userID.firstname + wallet.userID.lastname}`;
            registerReferenceTransactionWalletHistoryTransfer.idtransactiontype = transferencia.id;
            registerReferenceTransactionWalletHistoryTransfer.date_in = new Date();

            await queryRunner.manager.save(registerReferenceTransactionWalletHistoryTransfer);

            await queryRunner.commitTransaction();
        } catch (error) {
            console.log(error)
            await queryRunner.rollbackTransaction();
            return false;
        } finally {
            await queryRunner.release();
            return true;
        }
    }
    private async getWalletsByEmailUser(email: string, iso: string) {
        try {
            return await createQueryBuilder(SkiperWallet, "SkiperWallet")
                .innerJoinAndSelect("SkiperWallet.userID", "userID")
                .innerJoinAndSelect("SkiperWallet.currencyID", "currencyID")
                .where("currencyID.iso = :iso", { iso: iso })
                .andWhere("userID.email = :email and userID.idcountry = SkiperWallet.idcountry", { email: email })
                .getOne();

        } catch (error) {
            console.log(error);
        }
    }

    async WithdrawalToInternalWallet(walletId: number, amount: number) {
        let wallet = await this.walletservice.getById(walletId);
        if (wallet == undefined) {
            throw new HttpException(
                "wallet not exist!",
                HttpStatus.BAD_REQUEST,
            );
        }
        return this.RechargeInternalWallet(wallet, amount);
    }

    private async RechargeInternalWallet(wallet: SkiperWallet, amount: number): Promise<Boolean> {
        let connection = getConnection();
        let queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let result;
        let totalPaid = await createQueryBuilder("SkiperWalletsHistory")
            .innerJoin("SkiperWalletsHistory.transactiontype", "TransactionType")
            .innerJoin("SkiperWalletsHistory.paymentmethod", "paymentmethod")
            .select(`IFNULL(ROUND(
                SUM(CASE WHEN TransactionType.code = 'CR' AND paymentmethod.name = 'AlyPay'  THEN  SkiperWalletsHistory.amount ELSE 0 END) - 
                SUM(CASE WHEN TransactionType.code = 'DB' THEN  SkiperWalletsHistory.amount ELSE 0 END) -
                SUM(CASE WHEN TransactionType.code = 'DV' THEN  SkiperWalletsHistory.amount ELSE 0 END) -
                SUM(CASE WHEN TransactionType.code = 'RT' THEN  SkiperWalletsHistory.amount ELSE 0 END),2),0)  balance`)
            .where("SkiperWalletsHistory.idskiperwallet = :wallet", { wallet: wallet.id })
            .getRawOne();

        let recargaSaldo = await queryRunner.manager.findOne(TransactionType, { where: { code: 'RS' } });
        let debito = await queryRunner.manager.findOne(TransactionType, { where: { code: 'DB' } });
        let paymentMethod = await queryRunner.manager.findOne(PaymentMethods, { where: { name: 'AlyPay', active: true } });
        let verifiedWallet = await queryRunner.manager.findOne(SkiperWallet, { where: { id: wallet.id } });
        let amountPlusfees = amount + (amount * recargaSaldo.fees) / 100;

        if (totalPaid.balance == 0) {
            throw new HttpException(
                "you have no withdrawal balance",
                HttpStatus.FORBIDDEN,
            );
        }
        if (totalPaid.balance < amountPlusfees) {
            throw new HttpException(
                "your funds are not enough",
                HttpStatus.FORBIDDEN
            )
        }
        try {
            let registeWalletsHistoryTransfer = new SkiperWalletsHistory();
            registeWalletsHistoryTransfer.amount = amount;
            registeWalletsHistoryTransfer.idcurrency = wallet.idcurrency;
            registeWalletsHistoryTransfer.idskiperwallet = verifiedWallet.id;
            registeWalletsHistoryTransfer.idpayment_methods = paymentMethod.id;
            registeWalletsHistoryTransfer.description = 'Retiro a Balance Interno AlyPay';
            registeWalletsHistoryTransfer.idtransactiontype = debito.id;
            registeWalletsHistoryTransfer.date_in = new Date();
            let walletHistory = await queryRunner.manager.save(registeWalletsHistoryTransfer)

            let registerFeeWalletHistoryTransfer = new SkiperWalletsHistory();
            let fees = (amount * recargaSaldo.fees) / 100;
            registerFeeWalletHistoryTransfer.amount = Number(fees.toFixed(2));
            registerFeeWalletHistoryTransfer.idcurrency = wallet.idcurrency;
            registerFeeWalletHistoryTransfer.idskiperwallet = verifiedWallet.id;
            registerFeeWalletHistoryTransfer.idpayment_methods = paymentMethod.id;
            registerFeeWalletHistoryTransfer.description = 'Comisión por servicio Alypay';
            registerFeeWalletHistoryTransfer.idtransactiontype = debito.id;
            registerFeeWalletHistoryTransfer.date_in = new Date();
            await queryRunner.manager.save(registerFeeWalletHistoryTransfer);


            verifiedWallet.amount = parseFloat(verifiedWallet.amount.toString()) + amount;
            result = await queryRunner.manager.save(verifiedWallet);

            let registerReferenceTransactionWalletHistoryTransfer = new SkiperWalletsHistory();
            registerReferenceTransactionWalletHistoryTransfer.amount = amount;
            registerReferenceTransactionWalletHistoryTransfer.idcurrency = wallet.idcurrency;
            registerReferenceTransactionWalletHistoryTransfer.idskiperwallet = verifiedWallet.id;
            registerReferenceTransactionWalletHistoryTransfer.idpayment_methods = paymentMethod.id;
            registerReferenceTransactionWalletHistoryTransfer.description = 'Saldo acreditado';
            registerReferenceTransactionWalletHistoryTransfer.idtransactiontype = recargaSaldo.id;
            registerReferenceTransactionWalletHistoryTransfer.date_in = new Date();

            await queryRunner.manager.save(registerReferenceTransactionWalletHistoryTransfer);

            await queryRunner.commitTransaction();
        } catch (error) {
            console.log(error)
            await queryRunner.rollbackTransaction();
            return false;
        } finally {
            await queryRunner.release();
            return true;
        }
    }

    async getAll(): Promise<SkiperWalletsHistory[]> {
        return await this.repository.find({ relations: ['skiperwallet', 'transactiontype', 'paymentmethod', 'currency'] });
    }
    async getById(id: number): Promise<SkiperWalletsHistory> {
        return await this.repository.findOneOrFail()
    }

    async registerSkiperWalletHistory(input: SkiperWalletsHistoryInput) {
        try {
            let result = this.parseSkiperWalletHistory(input);
            return await this.repository.save(result);
        } catch (error) {
            console.error(error);
        }
    }

    async updateSkiperWalletHistory(input: SkiperWalletsHistoryInput) {
        try {
            let result = await this.getById(input.id);
            if (result) {
                result.amount = input.amount;
                result.date_in = input.date_in;
                result.idcurrency = input.idcurrency;
                result.idpayment_methods = input.idpayment_methods;
                result.description = input.description;
                result.idskiperwallet = input.idskiperwallet;
                result.idtransactiontype = input.idtransactiontype;
                return await this.repository.save(result);
            }
        } catch (error) {
            console.error(error);
        }
    }

    /*
    listando ganancias del dia
    select sum(swh.amount) ganancia from skiper_wallets_history swh
    where swh.id = 1;
    */
    async getGanaciaDelDia(idwallet: number, lat: number, lng: number, flat: boolean) {
        let result: any;
        if (flat) {
            let zonahoraria = geotz(lat, lng);
            let fecha = momentTimeZone().tz(zonahoraria.toString()).format("YYYY-MM-DD HH:mm:ss");
            //Definiendo el intervalo de un dia para otro
            let start = new Date(fecha);
            start.setHours(0, 0, 0, 0);
            let end = new Date(start);
            end.setDate(start.getDate() + 1);

            result = await createQueryBuilder("SkiperWalletsHistory")
                .innerJoin("SkiperWalletsHistory.transactiontype", "TransactionType")
                .innerJoin("SkiperWalletsHistory.paymentmethod", "paymentmethod")
                .select(`IFNULL(ROUND(
                    SUM(CASE WHEN TransactionType.code = 'CR' AND paymentmethod.name = 'AlyPay'  THEN  SkiperWalletsHistory.amount ELSE 0 END)-
                    SUM(CASE WHEN TransactionType.code = 'DB'  THEN  SkiperWalletsHistory.amount ELSE 0 END) -
                    SUM(CASE WHEN TransactionType.code = 'DV'  THEN  SkiperWalletsHistory.amount ELSE 0 END) -
                    SUM(CASE WHEN TransactionType.code = 'RT'  THEN  SkiperWalletsHistory.amount ELSE 0 END)
                    ,2), 0)`, "ganancia")
                .addSelect("COUNT(CASE WHEN TransactionType.code = 'CR' AND paymentmethod.name = 'AlyPay' THEN 1 END)", "viajes")
                .where(`SkiperWalletsHistory.date_in BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'`, { fecha })
                .andWhere("SkiperWalletsHistory.idskiperwallet = :idwallet", { idwallet })
                .getRawOne();
            console.log(result)
        } else {
            result = await createQueryBuilder("SkiperWalletsHistory")
                .innerJoin("SkiperWalletsHistory.transactiontype", "TransactionType")
                .innerJoin("SkiperWalletsHistory.paymentmethod", "paymentmethod")
                .select(`IFNULL(ROUND(
                    SUM(CASE WHEN TransactionType.code = 'CR' AND paymentmethod.name = 'AlyPay'  THEN  SkiperWalletsHistory.amount ELSE 0 END)-
                    SUM(CASE WHEN TransactionType.code = 'DB'  THEN  SkiperWalletsHistory.amount ELSE 0 END) -
                    SUM(CASE WHEN TransactionType.code = 'DV'  THEN  SkiperWalletsHistory.amount ELSE 0 END) -
                    SUM(CASE WHEN TransactionType.code = 'RT'  THEN  SkiperWalletsHistory.amount ELSE 0 END)
                    ,2), 0)`, "ganancia")
                .addSelect("COUNT(CASE WHEN TransactionType.code = 'CR' AND paymentmethod.name = 'AlyPay' THEN 1 END)", "viajes")
                .where("SkiperWalletsHistory.idskiperwallet = :idwallet", { idwallet })
                .getRawOne();
        }
        return (result === undefined) ? null : result;
    }

    async getSaldoHabilitado(idwallet: number, lat: number, long: number) {
        var options = {
            provider: 'google',
            httpAdapter: 'https', // Default
            apiKey: 'AIzaSyDJqxifvNO50af0t6Y9gaPCJ8hYtkbOmQ8', // for Mapquest, OpenCage, Google Premier
            formatter: 'json' // 'gpx', 'string', ...
        };
        var geocoder = node_geocoder(options);
        let zonahoraria = geotz(lat, long)
        let date = momentTimeZone().tz(zonahoraria.toString()).format("YYYY-MM-DD")
        var datecountry = await geocoder.reverse({ lat: lat, lon: long });
        let exchangeUSD = await this.getExchange(datecountry[0].country, date);
        let validateValue = (exchangeUSD != undefined && exchangeUSD.value != null) ? exchangeUSD.value : 0;
        let totalPaid = await createQueryBuilder("SkiperWalletsHistory")
            .innerJoin("SkiperWalletsHistory.transactiontype", "TransactionType")
            .innerJoin("SkiperWalletsHistory.paymentmethod", "paymentmethod")
            .select(`IFNULL(ROUND(
        SUM(CASE WHEN TransactionType.code = 'CR' AND paymentmethod.name = 'AlyPay'  THEN  SkiperWalletsHistory.amount ELSE 0 END) - 
        SUM(CASE WHEN TransactionType.code = 'DB'  THEN  SkiperWalletsHistory.amount ELSE 0 END) -
        SUM(CASE WHEN TransactionType.code = 'DV'  THEN  SkiperWalletsHistory.amount ELSE 0 END) -
        SUM(CASE WHEN TransactionType.code = 'RT'  THEN  SkiperWalletsHistory.amount ELSE 0 END),2),0)  balance`)
            .where("SkiperWalletsHistory.idskiperwallet = :wallet", { wallet: idwallet })
            .getRawOne();               
        let converToUSD = totalPaid.balance / validateValue;
        const requestOptions = {
            method: 'GET',
            uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
            qs: {
                'symbol': 'BTC,LTC,DASH,ETH'
            },

            headers: {
                'X-CMC_PRO_API_KEY': 'f78fa793-b95e-4a58-a0ef-760f070defb0'
            },
            json: true,
            gzip: true
        };

        return rp(requestOptions).then(response => {
            let balance = {
                balanceLocal: totalPaid.balance,
                balanceUSD: converToUSD.toFixed(2),
                balanceInBTC: (parseFloat(converToUSD.toFixed(2)) / response.data.BTC.quote.USD.price.toFixed(2)).toFixed(8),
                balanceInLTC: (parseFloat(converToUSD.toFixed(2)) / response.data.LTC.quote.USD.price.toFixed(2)).toFixed(8),
                balanceInETH: (parseFloat(converToUSD.toFixed(2)) / response.data.ETH.quote.USD.price.toFixed(2)).toFixed(8),
                balanceInDASH: (parseFloat(converToUSD.toFixed(2)) / response.data.DASH.quote.USD.price.toFixed(2)).toFixed(8)
            }
            return balance;
        }).catch((err) => {
            console.log('API call error:', err.message);
        });

        // console.log(exchange)
        //return (result === undefined) ? null : result;
    }
    async getExchange(nameCountry: string, date_in: string) {
        let connection = getConnection();
        let queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            let x = await queryRunner.manager.createQueryBuilder(ExchangeRate, "ExchangeRate")
                .innerJoin("ExchangeRate.country", "country")
                .where("country.name = :name ", { name: nameCountry })
                .andWhere("ExchangeRate.date_in = :date_in", { date_in: date_in })
                .getOne();
            // console.log(x)
            return x;
        } catch (error) {
            console.log(error)
        }
    }

    private parseSkiperWalletHistory(input: SkiperWalletsHistoryInput): SkiperWalletsHistory {
        let skiperwallethistory: SkiperWalletsHistory = new SkiperWalletsHistory();
        skiperwallethistory.amount = input.amount;
        skiperwallethistory.date_in = input.date_in;
        skiperwallethistory.idcurrency = input.idcurrency;
        skiperwallethistory.idpayment_methods = input.idpayment_methods;
        skiperwallethistory.description = input.description;
        skiperwallethistory.idskiperwallet = input.idskiperwallet;
        skiperwallethistory.idtransactiontype = input.idtransactiontype;
        return skiperwallethistory;
    }
}
