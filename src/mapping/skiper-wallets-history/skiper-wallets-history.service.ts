import { Injectable } from '@nestjs/common';
import { SkiperWalletsHistory } from './skiper-wallets-history.entity';
import { Repository, createQueryBuilder, getConnection } from 'typeorm';
import { SkiperWalletsHistoryInput } from './skiper-wallets-history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import geotz from 'geo-tz';
import momentTimeZone from 'moment-timezone';
import { ExchangeRate } from '../exchange-rate/exchange-rate.entity';
import node_geocoder from 'node-geocoder';
const rp = require('request-promise');

@Injectable()
export class SkiperWalletsHistoryService {
    constructor(
        @InjectRepository(SkiperWalletsHistory)
        private readonly repository: Repository<SkiperWalletsHistory>
    ) { }

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

    async convertBalance(){
        
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
        let result = await createQueryBuilder("SkiperWalletsHistory")
            .select("IFNULL(SUM(SkiperWalletsHistory.amount), 0)", "benabled")
            .innerJoin("SkiperWalletsHistory.transactiontype", "TransactionType")
            .where("SkiperWalletsHistory.idskiperwallet = :idwallet", { idwallet })
            .andWhere("SkiperWalletsHistory.paidout = 0")
            .andWhere("TransactionType.code = :tipotransaccion", { tipotransaccion: "CR" })
            .getRawOne();
        let converToUSD = result.benabled / validateValue;


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

       return  rp(requestOptions).then(response => {
            let balance = {
                balanceLocal: result.benabled,
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
