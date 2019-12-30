import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SkiperTravelsTracing } from './skiper-travels-tracing.entity';
import { SkiperTravelsTracingInput } from './skiper-travels-tracing.dto';
import { Repository, createQueryBuilder, getConnection } from 'typeorm';
import geotz from 'geo-tz';
import momentTimeZone from 'moment-timezone';
import { SkiperTravelsStatusService } from '../skiper-travels-status/skiper-travels-status.service';
import { SkiperTravelsService } from '../skiper-travels/skiper-travels.service';
import { SkiperTravels } from '../skiper-travels/skiper-travels.entity';
import { User } from '../users/user.entity';
import { SkiperWallet } from '../skiper-wallet/skiper-wallet.entity';
import { SkiperWalletsHistory } from '../skiper-wallets-history/skiper-wallets-history.entity';
import { TransactionType } from '../transaction-type/transaction-type.entity';
import { SkiperCatTravelsService } from '../skiper-cat-travels/skiper-cat-travels.service';
import { Countrie } from '../countries/countrie.entity';
import { SkiperAgent } from '../skiper-agent/skiper-agent.entity';
import { ExecutiveCommissions } from '../executive-commissions/executive-commissions.entity';
import { SkiperUserInvoice } from '../skiper-user-invoice/skiper-user-invoice.entity';
import { SkiperInvoiceDetail } from '../skiper-invoice-detail/skiper-invoice-detail.entity';
import { SkiperTravelsInput } from '../skiper-travels/skiper-travels.dto';
import { UserInput } from '../users/user.dto';


@Injectable()
export class SkiperTravelsTracingService {
    constructor(
        @InjectRepository(SkiperTravelsTracing)
        private readonly repository: Repository<SkiperTravelsTracing>,
        private readonly skiperTravelsStatusService: SkiperTravelsStatusService,
        private readonly skiperTravelsService: SkiperTravelsService,
        private readonly skiperCatTrevelsService: SkiperCatTravelsService
    ) { }

    async getAll(): Promise<SkiperTravelsTracing[]> {
        try {
            return await this.repository.find({
                relations: ['travel', 'travelstatus'],
            });

        } catch (error) {
            throw new HttpException(
                error,
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    async getById(id: number): Promise<SkiperTravelsTracing> {
        return await this.repository.findOneOrFail({
            where: { id },
        });
    }

    async registerTravelsTracing(input: SkiperTravelsTracingInput, lat_final_seggested: number, lng_final_seggested: number, address_suggested: string, distance: number, total: number, duration: number): Promise<SkiperTravelsTracing> {
        let verifyStatus = await this.verifyStatusByCode(input.idtravelstatus);
        if (verifyStatus) {
            let result = await this.verifyTravelTracing(input.idtravel, input.idtravelstatus);
            if (result) {
                throw new HttpException(
                    "El viaje ya existe con el estado indicado",
                    HttpStatus.BAD_REQUEST,
                );
            }
        }
        //vamos a validar que el estado exista con el estado previo.      
        let estado = await this.skiperTravelsStatusService.getByStatusCode(input.idtravelstatus);
        let travel = await this.skiperTravelsService.GetTravelByID(input.idtravel);

        if (travel == undefined) {
            throw new HttpException(
                "El viaje no existe",
                HttpStatus.BAD_REQUEST,
            );
        }

        if (travel.skiperTravelsTracing[0].travelstatus.id != estado.prevstatus && estado.prevstatus != 8 && estado.prevstatus != 9) {
            throw new HttpException(
                estado.errorstatusprev,
                HttpStatus.BAD_REQUEST,
            );
        }
        let result;
        var zonahoraria = geotz(input.lat, input.lng)
        var fecha = momentTimeZone().tz(zonahoraria.toString()).format("YYYY-MM-DD HH:mm:ss")
        input.fecha = fecha;
        let skiper_travel_tracing = this.parseSkiperTravelTracing(input, estado.id);
        if (estado.bgenerafactura) {
            if (estado.codigo == "FINALIZADOANTESDETIEMPO" && estado.bgenerafactura) {
                try {
                    let skiperTravelsInput = new SkiperTravelsInput();
                    skiperTravelsInput.lat_final_seggested = lat_final_seggested;
                    skiperTravelsInput.lng_final_seggested = lng_final_seggested;
                    skiperTravelsInput.address_suggested = address_suggested;
                    skiperTravelsInput.distance = distance;
                    skiperTravelsInput.Total = total;
                    skiperTravelsInput.time = duration;

                    let updateTravel = await this.skiperTravelsService.updateSkiperTravels(skiperTravelsInput);

                    result = await this.transactionPayment(skiper_travel_tracing, updateTravel);
                    result.travel = await this.skiperTravelsService.getById(skiper_travel_tracing.idtravel);
                    result.travelstatus = await this.skiperTravelsStatusService.getById(result.idtravelstatus);

                    return result;
                } catch (error) {
                    console.log(error)
                }
            }
            try {
                result = await this.transactionPayment(skiper_travel_tracing, travel);
                // console.log(result)
                result.travel = await this.skiperTravelsService.getById(skiper_travel_tracing.idtravel);
                result.travelstatus = await this.skiperTravelsStatusService.getById(result.idtravelstatus);

                return result;
            } catch (error) {
                console.log(error)
            }

        } else {
            result = await this.repository.save(skiper_travel_tracing);
            result.travelstatus = await this.skiperTravelsStatusService.getById(result.idtravelstatus);
            result.travel = await this.skiperTravelsService.getById(skiper_travel_tracing.idtravel);

            if (estado.codigo == "RECHAZADO" || estado.codigo == "CANCELADO") {
                let skipertravelinput = new SkiperTravelsInput();
                skipertravelinput.id = result.travel.id;
                skipertravelinput.state = true;
                await this.skiperTravelsService.updateSkiperTravels(skipertravelinput);
            }
            return result;
        }
    }

    private parseSkiperTravelTracing(input: SkiperTravelsTracingInput, idtravelstatus: number): SkiperTravelsTracing {
        let skipertravelstracing: SkiperTravelsTracing = new SkiperTravelsTracing();
        skipertravelstracing.idtravel = input.idtravel;
        skipertravelstracing.idtravelstatus = idtravelstatus;
        skipertravelstracing.lat = input.lat;
        skipertravelstracing.lng = input.lng;
        skipertravelstracing.datetracing = input.fecha;
        return skipertravelstracing;
    }

    private async verifyTravelTracing(idtravel: number, idstatus: string) {
        let result = await createQueryBuilder("SkiperTravelsTracing")
            .innerJoin("SkiperTravelsTracing.travelstatus", "TravelStatus")
            .where("TravelStatus.codigo = :status", { status: idstatus })
            .andWhere("SkiperTravelsTracing.idtravel = :idtravel", { idtravel })
            .getOne();
        return result;
    }

    private async verifyStatusByCode(code: string) {
        try {
            let result = await createQueryBuilder("SkiperTravelsStatus")
                .where("SkiperTravelsStatus.codigo = :code", { code })
                .getOne();
            return (result !== undefined) ? result : null;
        } catch (error) {
            console.log(error)
        }
    }

    //Transaccion fumada para debitar los pagos
    private async transactionPayment(travel_tracing: SkiperTravelsTracing, travel: SkiperTravels) {

        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();

        let result;
        //Iniciando la Transaccion
        await queryRunner.startTransaction();

        try {
            let user = await this.getUserDatafromDriver(travel.iddriver);
            let userAgent = await this.getSponsorByidUser(user.sponsor_id);
            let taxcountry = await this.getCountryByDrive(user.id);
            let amoutcommision = await this.skiperCatTrevelsService.getById(travel.idcattravel);
            let wallet = await this.getWalletFromDriver(user.id, travel.idcurrency);
            let transactiontype = await this.getTransactionType("DEBITO X VIAJE");
            let transactiontype2 = await this.getTransactionType("CREDITO");
            let valorviaje = (parseFloat(travel.total.toString()) * parseFloat(transactiontype.sign.toString()));
            let subtotaldebit = valorviaje * (parseInt(amoutcommision.paycommission.toString()) / 100);
            let commisionexecutive = subtotaldebit * (parseInt(amoutcommision.percentageagent.toString()) / 100)
            let calciva = subtotaldebit * (parseInt(taxcountry.tax.toString()) / 100);
            let totaldebit = subtotaldebit + calciva;
            wallet.amount = parseFloat(wallet.amount.toString()) + totaldebit;
            let walletHistory = new SkiperWalletsHistory();
            walletHistory.idskiperwallet = wallet.id;
            walletHistory.idtransactiontype = transactiontype.id;
            walletHistory.amount = -(totaldebit);
            walletHistory.idpayment_methods = travel.idpayment_methods;
            walletHistory.description = `Deduccion por el viaje ${travel.id}`;
            walletHistory.date_in = new Date();
            walletHistory.idcurrency = travel.idcurrency;

            let walletHistory2 = new SkiperWalletsHistory();
            walletHistory2.idskiperwallet = wallet.id;
            walletHistory2.idtransactiontype = transactiontype2.id;
            walletHistory2.amount = -(valorviaje - totaldebit);
            walletHistory2.idpayment_methods = travel.idpayment_methods;
            walletHistory2.description = `Ganancia del viaje numero ${travel.id}`;
            walletHistory2.date_in = new Date();
            walletHistory2.idcurrency = travel.idcurrency;

            let changestatetravel = await queryRunner.manager.findOne(SkiperTravels, { where: { id: travel.id } });
            changestatetravel.state = true;


            let executivecommision = new ExecutiveCommissions();
            executivecommision.agentID = userAgent.id;
            executivecommision.idreference = travel.id;
            executivecommision.amountcomission = -(commisionexecutive);
            executivecommision.idcurrency = travel.idcurrency;
            executivecommision.state = false;
            executivecommision.date_in = new Date();

            let consecutiveinvoice = await this.getCorrelativeInvoice(taxcountry.id);
            let skiperuserinvoice = await new SkiperUserInvoice();
            let skiperinvoicedetail = await new SkiperInvoiceDetail();
            if (consecutiveinvoice != undefined) {
                skiperuserinvoice.idcountry = taxcountry.id;
                skiperuserinvoice.numfac = consecutiveinvoice.numfac + 1;
                skiperuserinvoice.iduser = travel.idusers;
                skiperuserinvoice.anyagent = travel.iddriver;
                skiperuserinvoice.date_in = new Date();
            } else {
                skiperuserinvoice.idcountry = taxcountry.id;
                skiperuserinvoice.numfac = 1;
                skiperuserinvoice.iduser = travel.idusers;
                skiperuserinvoice.anyagent = travel.iddriver;
                skiperuserinvoice.date_in = new Date();
            }
            let resultuserinvoice = await queryRunner.manager.save(skiperuserinvoice);
            skiperinvoicedetail.iduserinvoice = resultuserinvoice.id;
            skiperinvoicedetail.idanyservice = travel.id;
            skiperinvoicedetail.total = travel.total;

            await queryRunner.manager.save(walletHistory2)
            await queryRunner.manager.save(skiperinvoicedetail);
            await queryRunner.manager.save(executivecommision);
            await queryRunner.manager.save(wallet);
            await queryRunner.manager.save(walletHistory);

            await queryRunner.manager.save(changestatetravel);

            result = await queryRunner.manager.save(travel_tracing);
            await queryRunner.commitTransaction();
        } catch (error) {
            console.log(error)
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
            return result;
        }
    }

    private async getCorrelativeInvoice(idcountry: number): Promise<SkiperUserInvoice> {
        try {
            return await createQueryBuilder(SkiperUserInvoice, "SkiperUserInvoice")
                .where("SkiperUserInvoice.idcountry = :idcountry", { idcountry: idcountry })
                .addOrderBy('SkiperUserInvoice.id', 'DESC')
                .limit(1)
                .getOne();
        } catch (error) {
            console.error(error)
        }

    }
    private async getSponsorByidUser(iduser: number): Promise<SkiperAgent> {
        try {
            return await createQueryBuilder(SkiperAgent, "SkiperAgent")
                .leftJoin("SkiperAgent.user", "User")
                .where("User.id = :id", { id: iduser })
                .getOne();
        } catch (error) {
            console.error(error)
        }
    }

    /*
        select u.* from users u
        left join skiper_agent sa on sa.iduser = u.id
        left join skiper_travels st on st.iddriver = sa.id
        where st.iddriver = 28; 28 es el iddriver
    */

    private async getUserDatafromDriver(iddriver: number): Promise<User> {
        return await createQueryBuilder(User, "User")
            .leftJoin("User.skiperAgent", "SkiperAgent")
            .leftJoin("SkiperAgent.skiperTravel", "SkiperTravels")
            .where("SkiperTravels.iddriver = :iddriver", { iddriver })
            .getOne();
    }

    private async getWalletFromDriver(iduser: number, idcurrency: number): Promise<SkiperWallet> {
        return await createQueryBuilder(SkiperWallet, "SkiperWallet")
            .where("SkiperWallet.iduser = :iduser", { iduser })
            .andWhere("SkiperWallet.idcurrency = :idcurrency", { idcurrency })
            .getOne();
    }
    /*  
    select c.* from countries c			
			left join users u on u.idcountry = c.id
			left join skiper_agent sa on sa.iduser = u.id 
			where sa.id = 205;        
    */

    private async getCountryByDrive(iduser: number): Promise<Countrie> {
        return await createQueryBuilder(Countrie, "Countrie")
            .leftJoin("Countrie.user", "User")
            .where("User.id = :id", { id: iduser })
            .getOne();

    }

    private async getTransactionType(name: string): Promise<TransactionType> {
        return await createQueryBuilder(TransactionType, "TransactionType")
            .where("TransactionType.name = :name", { name })
            .getOne();
    }
}
