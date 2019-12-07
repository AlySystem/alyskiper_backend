import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SkiperTravels } from './skiper-travels.entity';
import { Repository, getManager, getConnection } from 'typeorm';
import { SkiperTravelsInput, TravelTarifaDTo } from '../skiper-travels/skiper-travels.dto';
import { SkiperTravelsTracing } from '../skiper-travels-tracing/skiper-travels-tracing.entity';
import { SkiperTariffs } from '../skiper-tariffs/skiper-tariffs.entity';
import moment = require('moment');
import momentTimeZone from 'moment-timezone';
import { UserService } from '../users/user.service';
import { SkiperVehicle } from '../skiper-vehicle/skiper-vehicle.entity';
import geotz from 'geo-tz';
import { error } from 'util';

@Injectable()
export class SkiperTravelsService {
    constructor(
        @InjectRepository(SkiperTravels)
        private readonly repository: Repository<SkiperTravels>,
        private readonly userService: UserService
    ) { }

    async getAll(): Promise<SkiperTravels[]> {
        try {
            return await this.repository.find({
                relations: ['users', 'skiperagent', 'skipercattravel'],
            });

        } catch (error) {
            throw new HttpException(
                error,
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async getTravelPayment(id: number): Promise<any> {
        return await this.repository.findOneOrFail({
            select: ["total"],
            where: { id }
        });
    }

    private timeToDecimal(t) {
        t = t.split(':');
        return parseInt(t[0], 10) * 1 + parseInt(t[1], 10) / 60;
    }

    async CalcularTarifa(idcountry: number, idcity: number, idcategoriaviaje: number, date_init: Date): Promise<TravelTarifaDTo> {
        //console.log('entre aqui')
        //vamos a obtener el precio base
        var time = this.timeToDecimal(moment(new Date(date_init)).format("HH:mm:ss"))
        var tarifas = await getConnection().createQueryBuilder(SkiperTariffs, "SkiperTariffs")
            .innerJoinAndSelect("SkiperTariffs.driverShedule", "SkiperDriverSchedule")
            .where("SkiperTariffs.idcountry = :idcountry", { idcountry })
            .andWhere("SkiperTariffs.idcity = :idcity", { idcity })
            .andWhere("SkiperTariffs.id_skiper_cat_travels = :idcategoriaviaje", { idcategoriaviaje })
            .getMany()
        console.log(tarifas);
        // console.log('tarifas')
        // console.log(tarifas)
        if (tarifas.length == 0)
            throw new HttpException(
                "No hay tarifa configurada para los parametros de entrada",
                HttpStatus.BAD_REQUEST,
            );

        var tarifa = tarifas.filter(x =>
            (x.driverShedule.turn == "am-pm" &&
                this.timeToDecimal(x.driverShedule.start_time.toString()) <= time &&
                this.timeToDecimal(x.driverShedule.final_time.toString()) >= time)
            ||
            (x.driverShedule.turn == "pm-am" &&
                this.timeToDecimal(x.driverShedule.start_time.toString()) <= time &&
                time < 24)
            ||
            (x.driverShedule.turn == "pm-am" &&
                time >= 0 &&
                this.timeToDecimal(x.driverShedule.final_time.toString()) >= time)
        )[0]        
        var travelTarifaDTo = new TravelTarifaDTo();
        travelTarifaDTo.pricebase = tarifa.price_base;
        travelTarifaDTo.priceckilometer = tarifa.price_kilometer;
        travelTarifaDTo.priceminimun = tarifa.price_minimum;
        travelTarifaDTo.priceminute = tarifa.price_minute;
        return travelTarifaDTo
    }

    async GenerateTravel(inputviaje: SkiperTravelsInput): Promise<SkiperTravels> {
        try {
            //vamos a obtener la zona horaria del solicitante del viaje
            var zonahoraria = geotz(inputviaje.lat_initial, inputviaje.lng_initial)
            var fecha = momentTimeZone().tz(zonahoraria.toString()).format("YYYY-MM-DD HH:mm:ss")
            inputviaje.date_init = fecha;
            inputviaje.distance = (inputviaje.distance / 1000);
            inputviaje.time = (inputviaje.time / 60)
            //console.log("distancia " + inputviaje.distance, "tiempo " + inputviaje.time)
            let viaje = new SkiperTravels();
            //vamos a calcular la tarifa del viaje
            //vamos a obtener la categoria de drive y el pais y ciudad del drive
            var vehiculo = await getConnection()
                .createQueryBuilder(SkiperVehicle, "SkiperVehicle")
                .innerJoinAndSelect("SkiperVehicle.skiperVehicleAgent", "SkiperVehicleAgent")
                .innerJoinAndSelect("SkiperVehicleAgent.skiperAgent", "SkiperAgent")
                .innerJoinAndSelect("SkiperAgent.user", "User")
                .where("SkiperAgent.id = :userId", { userId: inputviaje.iddriver })
                .getOne()

            var usuario = await this.userService.findById(vehiculo.skiperVehicleAgent[0].skiperAgent.user.id)
            // se rompe aqui
            //console.log(usuario.country.id)
            //console.log(usuario.city.id)
            //console.log(vehiculo.id_cat_travel)
            var tarifa = await this.CalcularTarifa(usuario.country.id, usuario.city.id,
                vehiculo.id_cat_travel, inputviaje.date_init)
            //console.log(tarifa);
            //console.log(inputviaje);
            var ValorXKm = tarifa.priceckilometer * inputviaje.distance
            var ValorXMin = tarifa.priceminute * inputviaje.time
            var valorviaje = ValorXKm + ValorXMin + parseFloat(tarifa.pricebase.toString())
            inputviaje.Total = valorviaje <= tarifa.priceminimun ? tarifa.priceminimun : valorviaje
            // console.log("valorviaje " + valorviaje, "valorxkm " + ValorXKm, "valorxmin " + ValorXMin);
            await getManager().transaction(async transactionalEntityManager => {
                viaje = this.parseSkiperTravel(inputviaje)
                //console.log(viaje)
                var viajeregistrado = await transactionalEntityManager.save(viaje)
                let travelstracing = new SkiperTravelsTracing();
                travelstracing.datetracing = fecha;
                travelstracing.idtravel = viajeregistrado.id;
                travelstracing.idtravelstatus = 1;
                travelstracing.lat = inputviaje.lat_initial;
                travelstracing.lng = inputviaje.lng_initial;
                await transactionalEntityManager.save(travelstracing);
            });
            return viaje;
        }
        catch (error) {
            throw new HttpException(
                error,
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    async GetTravels(idagent: number): Promise<SkiperTravels[]> {

        try {
            return await this.repository.createQueryBuilder("SkiperTravels")
                .innerJoinAndSelect("SkiperTravels.users", "User")
                .innerJoinAndSelect("SkiperTravels.skiperagent", "SkiperAgent", "SkiperAgent.id = :idagent", { idagent })
                .innerJoinAndSelect("SkiperAgent.user", "AgentUser")
                .innerJoinAndSelect("SkiperTravels.skiperTravelsTracing", "SkiperTravelsTracing")
                .innerJoinAndSelect(subQuery => {
                    return subQuery
                        .select("SkiperTravelsTracing.idtravel", "idtravel").addSelect("MAX(SkiperTravelsTracing.datetracing)", "fecha")
                        .from(SkiperTravelsTracing, "SkiperTravelsTracing")
                        .groupBy("SkiperTravelsTracing.idtravel")
                }, "d", "SkiperTravelsTracing.idtravel = d.idtravel and SkiperTravelsTracing.datetracing = d.fecha")
                .innerJoinAndSelect("SkiperTravelsTracing.travelstatus", "SkiperTravelsStatus")
                .getMany();
        }
        catch (err) {
            throw new HttpException(
                err,
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    async GetTravelByID(idtravel: number): Promise<SkiperTravels> {
        return await this.repository.createQueryBuilder("SkiperTravels")
            .innerJoinAndSelect("SkiperTravels.users", "User")
            .innerJoinAndSelect("SkiperTravels.skiperagent", "Skiperagent")
            .innerJoinAndSelect("SkiperTravels.skiperTravelsTracing", "SkiperTravelsTracing")
            .innerJoinAndSelect(subQuery => {
                return subQuery
                    .select("SkiperTravelsTracing.idtravel", "idtravel").addSelect("MAX(SkiperTravelsTracing.datetracing)", "fecha")
                    .from(SkiperTravelsTracing, "SkiperTravelsTracing")
                    .groupBy("SkiperTravelsTracing.idtravel")
            }, "d", "SkiperTravelsTracing.idtravel = d.idtravel and SkiperTravelsTracing.datetracing = d.fecha")
            .innerJoinAndSelect("SkiperTravelsTracing.travelstatus", "SkiperTravelsStatus")
            .where("SkiperTravels.id = :idtravel", { idtravel })
            .getOne();
    }

    async getTravelByAgentId(idagent: number): Promise<SkiperTravels> {
        try {
            let result = await this.repository.createQueryBuilder("SkiperTravels")
                .innerJoinAndSelect("SkiperTravels.users", "User")
                .innerJoinAndSelect("SkiperTravels.skiperagent", "SkiperAgent")
                .innerJoinAndSelect("SkiperTravels.skiperTravelsTracing", "SkiperTravelsTracing")
                .innerJoinAndSelect(subQuery => {
                    return subQuery
                        .select("SkiperTravelsTracing.idtravel", "idtravel").addSelect("MAX(SkiperTravelsTracing.datetracing)", "fecha")
                        .from(SkiperTravelsTracing, "SkiperTravelsTracing")
                        .groupBy("SkiperTravelsTracing.idtravel")
                }, "d", "SkiperTravelsTracing.idtravel = d.idtravel and SkiperTravelsTracing.datetracing = d.fecha")
                .innerJoinAndSelect("SkiperTravelsTracing.travelstatus", "SkiperTravelsStatus")
                .where("SkiperAgent.id = :idagent", { idagent })
                .andWhere("SkiperTravelsTracing.idtravelstatus IN (:idstatus)", { idstatus: [1, 3, 4, 5, 6, 7] })
                .getOne();
            return result;
        } catch (error) {
            console.log(error)
        }
    }

    async getTravelByUserId(iduser: number): Promise<SkiperTravels> {
        try {
            let result = await this.repository.createQueryBuilder("SkiperTravels")
                .innerJoinAndSelect("SkiperTravels.users", "User")
                .innerJoinAndSelect("SkiperTravels.skiperagent", "SkiperAgent")
                .innerJoinAndSelect("SkiperAgent.skiperVehicleAgent", "SkiperVehicleAgent")
                .innerJoinAndSelect("SkiperAgent.user", "Users")
                .innerJoinAndSelect("SkiperVehicleAgent.skiperVehicle", "SkiperVehicle")
                .innerJoinAndSelect("SkiperVehicle.vehicleModel", "VehicleModels")
                .innerJoinAndSelect("SkiperVehicle.vehicleTrademark", "VehicleTrademark")
                .innerJoinAndSelect("SkiperVehicle.vehicleYear", "VehicleYears")
                .innerJoinAndSelect("SkiperTravels.skiperTravelsTracing", "SkiperTravelsTracing")
                .innerJoinAndSelect(subQuery => {
                    return subQuery
                        .select("SkiperTravelsTracing.idtravel", "idtravel")
                        .addSelect("MAX(SkiperTravelsTracing.datetracing)", "fecha")
                        .from(SkiperTravelsTracing, "SkiperTravelsTracing")
                        .groupBy("SkiperTravelsTracing.idtravel")
                }, "d", "SkiperTravelsTracing.idtravel = d.idtravel and SkiperTravelsTracing.datetracing = d.fecha")
                .innerJoinAndSelect("SkiperTravelsTracing.travelstatus", "SkiperTravelsStatus")
                .where("User.id = :iduser", { iduser })
                .andWhere("SkiperTravelsTracing.idtravelstatus IN (:idstatus)", { idstatus: [1, 3, 4, 5, 6, 7] })
                .getOne()
                .then(item => (item == undefined) ? null : item);
            return result;
        } catch (error) {
            console.log(error);
        }
    }

    async getById(id: number): Promise<SkiperTravels> {
        return await this.repository.findOneOrFail({
            where: { id }
        });
    }

    registerTravels(input: SkiperTravelsInput): Promise<SkiperTravels> {
        try {
            let skipertravel = this.parseSkiperTravel(input);
            return this.repository.save(skipertravel);

        } catch (error) {
            throw new HttpException(
                error,
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async updateSkiperTravels(input: SkiperTravelsInput): Promise<SkiperTravels> {
        try {
            let skipertravel = await this.getById(input.id);
            skipertravel = this.parseSkiperTravel(input);
            skipertravel.id = input.id;
            return this.repository.save(skipertravel);

        } catch (error) {
            throw new HttpException(
                error,
                HttpStatus.BAD_REQUEST
            )
        }
    }

    private parseSkiperTravel(input: SkiperTravelsInput): SkiperTravels {
        let skipertravel: SkiperTravels = new SkiperTravels();
        skipertravel.idusers = input.idusers;
        skipertravel.iddriver = input.iddriver;
        skipertravel.idcurrency = input.idcurrency;
        skipertravel.idpayment_methods = input.idpayment_methods;
        skipertravel.lat_initial = input.lat_initial;
        skipertravel.lng_initial = input.lng_initial;
        skipertravel.lat_final_seggested = input.lat_final_seggested;
        skipertravel.lng_final_seggested = input.lng_final_seggested;
        skipertravel.lat_final = input.lat_final;
        skipertravel.lng_final = input.lng_final;
        skipertravel.date_init = input.date_init;
        skipertravel.distance = input.distance;
        skipertravel.total = input.Total;
        skipertravel.address_initial = input.address_initial;
        skipertravel.address_final = input.address_final;
        skipertravel.address_suggested = input.address_suggested;
        skipertravel.duration = input.time;
        skipertravel.idcattravel = input.categoryId;

        console.log(skipertravel)
        return skipertravel;
    }
}
