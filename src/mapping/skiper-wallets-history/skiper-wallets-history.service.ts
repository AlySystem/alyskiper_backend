import { Injectable } from '@nestjs/common';
import { SkiperWalletsHistory } from './skiper-wallets-history.entity';
import { Repository, createQueryBuilder } from 'typeorm';
import { SkiperWalletsHistoryInput } from './skiper-wallets-history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import geotz from 'geo-tz';
import momentTimeZone from 'moment-timezone';
import { stat } from 'fs';

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
                .select("IFNULL(SUM(SkiperWalletsHistory.amount), 0)", "ganancia")
                .addSelect("COUNT(1)", "viajes")
                .innerJoin("SkiperWalletsHistory.transactiontype", "TransactionType")
                .where(`SkiperWalletsHistory.date_in BETWEEN '${start.toISOString()}' AND '${end.toISOString()}'`, { fecha })
                .andWhere("SkiperWalletsHistory.idskiperwallet = :idwallet", { idwallet })
                .andWhere("TransactionType.name = :tipotransaccion", { tipotransaccion: "CREDITO" })
                .getRawOne();
        } else {
            result = await createQueryBuilder("SkiperWalletsHistory")
                .select("IFNULL(SUM(SkiperWalletsHistory.amount), 0)", "ganancia")
                .addSelect("COUNT(1)", "viajes")
                .innerJoin("SkiperWalletsHistory.transactiontype", "TransactionType")
                .where("SkiperWalletsHistory.idskiperwallet = :idwallet", { idwallet })
                .andWhere("TransactionType.name = :tipotransaccion", { tipotransaccion: "CREDITO" })
                .getRawOne();
        }
        return (result === undefined) ? null : result;
    }
    async getSaldoHabilitado(idwallet: number) {
        let result = await createQueryBuilder("SkiperWalletsHistory")
            .select("IFNULL(SUM(SkiperWalletsHistory.amount), 0)", "benabled")
            .innerJoin("SkiperWalletsHistory.transactiontype", "TransactionType")
            .where("SkiperWalletsHistory.idskiperwallet = :idwallet", { idwallet })
            .andWhere("SkiperWalletsHistory.paidout = 0")
            .andWhere("TransactionType.name = :tipotransaccion", { tipotransaccion: "CREDITO" })
            .getRawOne();
        return (result === undefined) ? null : result;
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
