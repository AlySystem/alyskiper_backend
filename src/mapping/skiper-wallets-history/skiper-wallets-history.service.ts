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

    async WithdrawalToInternalWallet(walletId: number) {
        let wallet = await this.walletservice.getById(walletId);
        if (wallet == undefined) {
            throw new HttpException(
                "wallet not exist!",
                HttpStatus.BAD_REQUEST,
            );
        }
        return this.RechargeInternalWallet(wallet);
    }

    private async RechargeInternalWallet(wallet: SkiperWallet): Promise<Boolean> {
        let connection = getConnection();
        let queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let result;
        try {
            //AND SkiperWalletsHistory.idskiperwallet = ${wallet.id}
            let totalPaid = await createQueryBuilder("SkiperWalletsHistory")
                .innerJoin("SkiperWalletsHistory.transactiontype", "TransactionType")
                .innerJoin("SkiperWalletsHistory.paymentmethod", "paymentmethod")                
                .select(`
                SUM(CASE WHEN TransactionType.code = 'CR' AND paymentmethod.name = 'AlyPay'  THEN  SkiperWalletsHistory.amount ELSE 0 END) - 
                SUM(CASE WHEN TransactionType.code = 'DB' AND SkiperWalletsHistory.typeUser = 1  THEN  SkiperWalletsHistory.amount ELSE 0 END) -
                SUM(CASE WHEN TransactionType.code = 'DV' AND SkiperWalletsHistory.typeUser = 1 THEN  SkiperWalletsHistory.amount ELSE 0 END) -
                SUM(CASE WHEN TransactionType.code = 'RT' AND SkiperWalletsHistory.typeUser = 1 THEN  SkiperWalletsHistory.amount ELSE 0 END)  balance`)      
                .where("SkiperWalletsHistory.idskiperwallet = :wallet",{wallet:wallet.id})                    
                .getRawOne();
            console.log(totalPaid)

            // if (totalPaid.benabled == 0) {
            //     throw new HttpException(
            //         "you have no withdrawal balance",
            //         HttpStatus.BAD_REQUEST,
            //     );
            // }
            // let retiro = await queryRunner.manager.findOne(TransactionType, { where: { code: 'RT' } });
            // let credito = await queryRunner.manager.findOne(TransactionType, { where: { code: 'CR' } });
            // let debito = await queryRunner.manager.findOne(TransactionType, { where: { code: 'DB' } });
            // let paymentMethod = await queryRunner.manager.findOne(PaymentMethods, { where: { name: 'AlyPay', active: true } });
            // let verifiedWallet = await queryRunner.manager.findOne(SkiperWallet, { where: { id: wallet.id } });

            // let registeWalletsHistoryTransfer = new SkiperWalletsHistory();
            // registeWalletsHistoryTransfer.amount = totalPaid.benabled;
            // registeWalletsHistoryTransfer.idcurrency = wallet.idcurrency;
            // registeWalletsHistoryTransfer.idskiperwallet = verifiedWallet.id;
            // registeWalletsHistoryTransfer.idpayment_methods = paymentMethod.id;
            // registeWalletsHistoryTransfer.description = 'Retiro a Balance Interno AlyPay';
            // registeWalletsHistoryTransfer.idtransactiontype = retiro.id;
            // registeWalletsHistoryTransfer.date_in = new Date();

            // let walletHistory = await queryRunner.manager.save(registeWalletsHistoryTransfer)

            // let registerFeeWalletHistoryTransfer = new SkiperWalletsHistory();
            // registerFeeWalletHistoryTransfer.amount = (totalPaid.benabled * retiro.fees) / 100;
            // registerFeeWalletHistoryTransfer.idcurrency = wallet.idcurrency;
            // registerFeeWalletHistoryTransfer.idskiperwallet = verifiedWallet.id;
            // registerFeeWalletHistoryTransfer.idpayment_methods = paymentMethod.id;
            // registerFeeWalletHistoryTransfer.description = 'Debito por retiro a balance interno';
            // registerFeeWalletHistoryTransfer.idtransactiontype = debito.id;
            // registerFeeWalletHistoryTransfer.date_in = new Date();

            // await queryRunner.manager.save(registerFeeWalletHistoryTransfer);

            // let fees = ((totalPaid.benabled * retiro.fees) / 100).toFixed(2);
            // let total = (totalPaid.benabled - parseFloat(fees));
            // verifiedWallet.amount = parseFloat(verifiedWallet.amount.toString()) + (total);
            // result = await queryRunner.manager.save(verifiedWallet);

            // let registerReferenceTransactionWalletHistoryTransfer = new SkiperWalletsHistory();
            // registerReferenceTransactionWalletHistoryTransfer.amount = (totalPaid.benabled - ((totalPaid.benabled * retiro.fees) / 100));
            // registerReferenceTransactionWalletHistoryTransfer.idcurrency = wallet.idcurrency;
            // registerReferenceTransactionWalletHistoryTransfer.idskiperwallet = verifiedWallet.id;
            // registerReferenceTransactionWalletHistoryTransfer.idpayment_methods = paymentMethod.id;
            // registerReferenceTransactionWalletHistoryTransfer.description = 'Saldo acreditado por retiro en saldo habilitado';
            // registerReferenceTransactionWalletHistoryTransfer.idtransactiontype = credito.id;
            // registerReferenceTransactionWalletHistoryTransfer.date_in = new Date();

            // await queryRunner.manager.save(registerReferenceTransactionWalletHistoryTransfer);

            // // let whistoryUpdateRecord = await createQueryBuilder(SkiperWalletsHistory, "SkiperWalletsHistory")
            // //     .innerJoin("SkiperWalletsHistory.transactiontype", "TransactionType")
            // //     .where("SkiperWalletsHistory.idskiperwallet = :walletId", { walletId: walletHistory.idskiperwallet })
            // //     .andWhere("TransactionType.code = :tipotransaccion", { tipotransaccion: "CR" })
            // //     .andWhere('SkiperWalletsHistory.paidout = 0').getMany();
            // // for (let i = 0; i < whistoryUpdateRecord.length; i++) {
            // //     whistoryUpdateRecord[i].paidout = true;
            // // }
            // // await queryRunner.manager.save(whistoryUpdateRecord);
            // await queryRunner.commitTransaction();
        } catch (error) {
            console.log(error)
            await queryRunner.rollbackTransaction();
            return null;
        } finally {
            await queryRunner.release();
            return result;
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
            //Haciendo la busqueda
            result = await createQueryBuilder("SkiperWalletsHistory")
                .select("IFNULL(ROUND(SUM(SkiperWalletsHistory.amount),2), 0)", "ganancia")
                .addSelect("COUNT(1)", "viajes")
                .innerJoin("SkiperWalletsHistory.transactiontype", "TransactionType")
                .where(`SkiperWalletsHistory.date_in BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'`, { fecha })
                .andWhere("SkiperWalletsHistory.idskiperwallet = :idwallet", { idwallet })
                .andWhere("TransactionType.name = :tipotransaccion", { tipotransaccion: "CREDITO" })
                .getRawOne();
        } else {
            result = await createQueryBuilder("SkiperWalletsHistory")
                .select("IFNULL(ROUND(SUM(SkiperWalletsHistory.amount),2), 0)", "ganancia")
                .addSelect("COUNT(1)", "viajes")
                .innerJoin("SkiperWalletsHistory.transactiontype", "TransactionType")
                .where("SkiperWalletsHistory.idskiperwallet = :idwallet", { idwallet })
                .andWhere("TransactionType.name = :tipotransaccion", { tipotransaccion: "CREDITO" })
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
        .select(`
        SUM(CASE WHEN TransactionType.code = 'CR' AND paymentmethod.name = 'AlyPay'  THEN  SkiperWalletsHistory.amount ELSE 0 END) - 
        SUM(CASE WHEN TransactionType.code = 'DB' AND SkiperWalletsHistory.typeUser = 1  THEN  SkiperWalletsHistory.amount ELSE 0 END) -
        SUM(CASE WHEN TransactionType.code = 'DV' AND SkiperWalletsHistory.typeUser = 1 THEN  SkiperWalletsHistory.amount ELSE 0 END) -
        SUM(CASE WHEN TransactionType.code = 'RT' AND SkiperWalletsHistory.typeUser = 1 THEN  SkiperWalletsHistory.amount ELSE 0 END)  balance`)      
        .where("SkiperWalletsHistory.idskiperwallet = :wallet",{wallet:idwallet})                    
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
