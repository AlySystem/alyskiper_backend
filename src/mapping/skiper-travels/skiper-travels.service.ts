import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SkiperTravels } from './skiper-travels.entity';
import { Repository, getManager, getConnection, createQueryBuilder, QueryBuilder, Double } from 'typeorm';
import { SkiperTravelsInput, ValidateSkiperDriveInput, ValidateUserInput, AllCategoryDto } from '../skiper-travels/skiper-travels.dto';
import { SkiperTravelsTracing } from '../skiper-travels-tracing/skiper-travels-tracing.entity';
import { SkiperTariffs } from '../skiper-tariffs/skiper-tariffs.entity';
import moment = require('moment');
import momentTimeZone from 'moment-timezone';
import { UserService } from '../users/user.service';
import { SkiperVehicle } from '../skiper-vehicle/skiper-vehicle.entity';
import geotz from 'geo-tz';
import { Cities } from '../cities/cities.entity';
import geoip_lite from 'geoip-lite';
import node_geocoder from 'node-geocoder';
import { Countrie } from '../countries/countrie.entity';
import { SkiperWalletService } from '../skiper-wallet/skiper-wallet.service';
import { SkiperWallet } from '../skiper-wallet/skiper-wallet.entity';
import { User } from '../users/user.entity';
import { SkiperCatTravelsService } from '../skiper-cat-travels/skiper-cat-travels.service';
import { Currency } from '../currency/currency.entity';
import { SkiperCatTravelDto, SilverDto, GoldenDto, VipDto, PresidentDto } from '../skiper-cat-travels/skiper-cat-travel.dto';
import { TravelTarifaDTo } from './skiper-travels.dto';
require('isomorphic-fetch');

@Injectable()
export class SkiperTravelsService {
    constructor(
        @InjectRepository(SkiperTravels)
        private readonly repository: Repository<SkiperTravels>,
        private readonly userService: UserService,
        private readonly skiperwalletservice: SkiperWalletService,
        private readonly skipercattravelservice: SkiperCatTravelsService

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

    async CategoryTravelsWhitPrice(ip: string, lat: number, lng: number, distance: number, duration: number) {
        let skipercatTravels = this.skipercattravelservice.getAll()
        let silver = this.CalcularTarifa(ip, 1, lat, lng);
        let golden = this.CalcularTarifa(ip, 2, lat, lng);
        let vip = this.CalcularTarifa(ip, 3, lat, lng);
        let president = this.CalcularTarifa(ip, 4, lat, lng);

        return Promise.all([silver, golden, vip, president, skipercatTravels]).then(result => {

            let silverdto = new SilverDto();
            silverdto.id = result[4][0].id;
            silverdto.name = result[4][0].name;
            silverdto.url_img_category = result[4][0].url_img_category;
            silverdto.urlImgName = result[4][0].urlImgName;
            silverdto.total = this.calcaulatePriceSilver(distance, duration, result[0].priceckilometer, result[0].priceminute, result[0].pricebase, result[0].priceminimun);
            silverdto.currency = result[0].currencyID;
            silverdto.symbol = result[0].symbol;


            let goldendto = new GoldenDto();
            goldendto.id = result[4][1].id;
            goldendto.name = result[4][1].name;
            goldendto.url_img_category = result[4][1].url_img_category;
            goldendto.urlImgName = result[4][1].urlImgName;
            goldendto.total = this.calcaulatePriceGolden(distance, duration, result[1].priceckilometer, result[1].priceminute, result[1].pricebase, result[1].priceminimun);
            goldendto.currency = result[0].currencyID;
            goldendto.symbol = result[0].symbol;

            let vipdto = new VipDto();
            vipdto.id = result[4][2].id;
            vipdto.name = result[4][2].name;
            vipdto.url_img_category = result[4][2].url_img_category;
            vipdto.urlImgName = result[4][2].urlImgName;
            vipdto.total = this.calcaulatePriceVip(distance, duration, result[2].priceckilometer, result[2].priceminute, result[2].pricebase, result[2].priceminimun);
            vipdto.currency = result[0].currencyID;
            vipdto.symbol = result[0].symbol;

            let presidentdto = new PresidentDto();
            presidentdto.id = result[4][3].id;
            presidentdto.name = result[4][3].name;
            presidentdto.url_img_category = result[4][3].url_img_category;
            presidentdto.urlImgName = result[4][3].urlImgName;
            presidentdto.total = this.calcaulatePricePresident(distance, duration, result[3].priceckilometer, result[3].priceminute, result[3].pricebase, result[3].priceminimun);
            presidentdto.currency = result[0].currencyID;
            presidentdto.symbol = result[0].symbol;

            let allcategory = new AllCategoryDto();
            allcategory.silver = silverdto;
            allcategory.golden = goldendto;
            allcategory.vip = vipdto;
            allcategory.president = presidentdto;

            return allcategory;

        })
    }

    calcaulatePriceSilver(distance: number, duration: number, priceckilometer: number, priceminute: number, pricebase: number, priceminimun: number, ) {
        try {
            distance = (distance / 1000);
            duration = (duration / 60)

            let ValorXKm = priceckilometer * distance;
            let ValorXMin = priceminute * duration;
            let valorviaje = ValorXKm + ValorXMin + parseFloat(pricebase.toString())
            let total = valorviaje <= priceminimun ? priceminimun : valorviaje
            return total;
        } catch (error) {

        }
    }
    calcaulatePriceGolden(distance: number, duration: number, priceckilometer: number, priceminute: number, pricebase: number, priceminimun: number, ) {
        distance = (distance / 1000);
        duration = (duration / 60)

        let ValorXKm = priceckilometer * distance;
        let ValorXMin = priceminute * duration;
        let valorviaje = ValorXKm + ValorXMin + parseFloat(pricebase.toString())
        let total = valorviaje <= priceminimun ? priceminimun : valorviaje
        return total;
    }
    calcaulatePriceVip(distance: number, duration: number, priceckilometer: number, priceminute: number, pricebase: number, priceminimun: number, ) {
        distance = (distance / 1000);
        duration = (duration / 60)

        let ValorXKm = priceckilometer * distance;
        let ValorXMin = priceminute * duration;
        let valorviaje = ValorXKm + ValorXMin + parseFloat(pricebase.toString())
        let total = valorviaje <= priceminimun ? priceminimun : valorviaje

        return total;
    }
    calcaulatePricePresident(distance: number, duration: number, priceckilometer: number, priceminute: number, pricebase: number, priceminimun: number, ) {
        distance = (distance / 1000);
        duration = (duration / 60)

        let ValorXKm = priceckilometer * distance;
        let ValorXMin = priceminute * duration;
        let valorviaje = ValorXKm + ValorXMin + parseFloat(pricebase.toString())
        let total = valorviaje <= priceminimun ? priceminimun : valorviaje

        return total;
    }

    async CalcularTarifa(ip: string, idcategoriaviaje: number, lat: number, lng: number): Promise<TravelTarifaDTo> {
        //AIzaSyDRc0P0ozp5BU98gDG06OXbFaGk3OiOYxw
        var options = {
            provider: 'google',
            httpAdapter: 'https', // Default
            apiKey: 'AIzaSyDJqxifvNO50af0t6Y9gaPCJ8hYtkbOmQ8', // for Mapquest, OpenCage, Google Premier
            formatter: 'json' // 'gpx', 'string', ...
        };
        var geocoder = node_geocoder(options);
        var datecountry = await geocoder.reverse({ lat: lat, lon: lng })

        /*  const url = `https://ipinfo.io/${ip}?token=e4749da149b3e2`;
   
          var datecountry = await fetch(url)
              .then(response => response.json())
              .then(json => {
                  if (json.status !== 'OK') {
                      console.log(json.status)
                      const errorMessage = json.error_message || 'Unknown error';
                      throw new HttpException(
                          errorMessage,
                          HttpStatus.BAD_REQUEST
                      );
                  }
                  console.log(json)
              });*/

        var zonahoraria = geotz(lat, lng);
        var fecha = momentTimeZone().tz(zonahoraria.toString()).format("YYYY-MM-DD HH:mm:ss")

        let country = await this.getCountrieByName(datecountry[0].country);

        if (country == undefined) {
            throw new HttpException(
                "There are no rates available in this country",
                HttpStatus.BAD_REQUEST
            )
        }

        var time = this.timeToDecimal(moment(new Date(fecha)).format("HH:mm:ss"))
        var tarifas = await getConnection().createQueryBuilder(SkiperTariffs, "SkiperTariffs")
            .innerJoinAndSelect("SkiperTariffs.driverShedule", "SkiperDriverSchedule")
            .where("SkiperTariffs.idcountry = :idcountry", { idcountry: country.id })
            //.andWhere("SkiperTariffs.idcity = :idcity", { idcity: citie.id })
            .andWhere("SkiperTariffs.id_skiper_cat_travels = :idcategoriaviaje", { idcategoriaviaje })
            .getMany()
        if (tarifas.length == 0)
            throw new HttpException(
                "There are no rates available in this country",
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

        let getcurrency = await getConnection().createQueryBuilder(Currency, "Currency")
            .where("Currency.idcountry = :idcountry", { idcountry: tarifa.idcountry }).getOne();
        var travelTarifaDTo = new TravelTarifaDTo();
        travelTarifaDTo.pricebase = tarifa.price_base;
        travelTarifaDTo.priceckilometer = tarifa.price_kilometer;
        travelTarifaDTo.priceminimun = tarifa.price_minimum;
        travelTarifaDTo.priceminute = tarifa.price_minute;
        travelTarifaDTo.currencyID = getcurrency.id;
        travelTarifaDTo.symbol = tarifa.symbol;

        return travelTarifaDTo
    }
    async getCountrieByName(name: string) {
        try {
            return await getConnection().createQueryBuilder(Countrie, "Countrie")
                .where("Countrie.name = :name", { name: name.toUpperCase() }).getOne();
        } catch (error) {
            throw new HttpException(
                "Error get country" + error,
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async ValidateUser(inputviaje: ValidateUserInput) {
        let searchUserIfHasTravels = await this.repository.find({
            where: { idusersa: inputviaje.userId, state: false }
        });

        if (searchUserIfHasTravels.length != 0) {
            throw new HttpException(
                "Error user is in other travel",
                HttpStatus.BAD_REQUEST
            );
            return false;

        } else {
            let zonahoraria = geotz(inputviaje.latInitial, inputviaje.lngInitial)
            let fecha = momentTimeZone().tz(zonahoraria.toString()).format("YYYY-MM-DD HH:mm:ss")
            inputviaje.dateInit = fecha;
            inputviaje.distance = (inputviaje.distance / 1000);
            inputviaje.time = (inputviaje.time / 60)
            //console.log("distancia " + inputviaje.distance, "tiempo " + inputviaje.time)
            let viaje = new SkiperTravels();
            //vamos a calcular la tarifa del viaje
            //vamos a obtener la categoria de drive y el pais y ciudad del drive
            let vehiculo = await getConnection()
                .createQueryBuilder(SkiperVehicle, "SkiperVehicle")
                .innerJoinAndSelect("SkiperVehicle.skiperVehicleAgent", "SkiperVehicleAgent")
                .innerJoinAndSelect("SkiperVehicleAgent.skiperAgent", "SkiperAgent")
                .innerJoinAndSelect("SkiperAgent.user", "User")
                .where("SkiperAgent.id = :userId", { userId: inputviaje.driverId })
                .getOne();

            if (vehiculo == undefined) {
                /*throw new HttpException(
                    'Error the drive does not have vehicle available',
                    HttpStatus.BAD_REQUEST
                );*/
                console.log("Error the drive does not have vehicle available");
                return false;
            }

            let tarifa = await this.CalcularTarifa(inputviaje.ip, vehiculo.id_cat_travel, inputviaje.latInitial, inputviaje.lngInitial)
            //console.log(tarifa)
            //console.log(tarifa);
            //console.log(inputviaje);
            let ValorXKm = tarifa.priceckilometer * inputviaje.distance
            let ValorXMin = tarifa.priceminute * inputviaje.time
            let valorviaje = ValorXKm + ValorXMin + parseFloat(tarifa.pricebase.toString())
            inputviaje.Total = valorviaje <= tarifa.priceminimun ? tarifa.priceminimun : valorviaje

            let user = await this.userService.getUserById(inputviaje.userId);
            let wallet = await this.getWalletFromUser(user.id, inputviaje.idcurrency);

            if (wallet == undefined) {
                /*throw new HttpException(
                    "Error the drive does not have wallet available",
                    HttpStatus.BAD_REQUEST
                );*/
                console.log("Error the user does not have wallet available");
                return false;
            }
            // let getTax = await this.getCountryByDrive(inputviaje.driverId);
            // let tax = (getTax.tax == null) ? 0 : getTax.tax;
            // let skiperPorcentagePay = await this.skipercattravelservice.getById(inputviaje.categoryTravelId);
            // let subtotal = (inputviaje.Total * parseInt(skiperPorcentagePay.paycommission.toString())) / 100;
            // let calcTax = (subtotal * tax) / 100;
            // let totaldebit = subtotal + calcTax;

            if (parseFloat(wallet.amount.toString()) < parseFloat(inputviaje.Total.toFixed(2))) {
                /*throw new HttpException(
                    "Error the drive does not have enough funds",
                    HttpStatus.BAD_REQUEST
                );*/
                console.log("Error the drive does not have enough funds");
                return false;
            }
            return true;
        }
    }

    async ValidateDriveAvailable(inputviaje: ValidateSkiperDriveInput) {
        let searchDriveIfHasTravels = await this.repository.find({
            where: { iddriver: inputviaje.iddriver, state: false }
        });

        if (searchDriveIfHasTravels.length != 0) {
            throw new HttpException(
                "Error drive is in other travel",
                HttpStatus.BAD_REQUEST
            );
            return false;

        } else {
            let zonahoraria = geotz(inputviaje.lat_initial, inputviaje.lng_initial)
            let fecha = momentTimeZone().tz(zonahoraria.toString()).format("YYYY-MM-DD HH:mm:ss")
            inputviaje.date_init = fecha;
            inputviaje.distance = (inputviaje.distance / 1000);
            inputviaje.time = (inputviaje.time / 60)
            //console.log("distancia " + inputviaje.distance, "tiempo " + inputviaje.time)
            let viaje = new SkiperTravels();
            //vamos a calcular la tarifa del viaje
            //vamos a obtener la categoria de drive y el pais y ciudad del drive
            let vehiculo = await getConnection()
                .createQueryBuilder(SkiperVehicle, "SkiperVehicle")
                .innerJoinAndSelect("SkiperVehicle.skiperVehicleAgent", "SkiperVehicleAgent")
                .innerJoinAndSelect("SkiperVehicleAgent.skiperAgent", "SkiperAgent")
                .innerJoinAndSelect("SkiperAgent.user", "User")
                .where("SkiperAgent.id = :userId", { userId: inputviaje.iddriver })
                .getOne();

            if (vehiculo == undefined) {
                /*throw new HttpException(
                    'Error the drive does not have vehicle available',
                    HttpStatus.BAD_REQUEST
                );*/
                console.log("Error the drive does not have vehicle available");
                return false;
            }

            let tarifa = await this.CalcularTarifa(inputviaje.ip, vehiculo.id_cat_travel, inputviaje.lat_initial, inputviaje.lng_initial)
            //console.log(tarifa)
            //console.log(tarifa);
            //console.log(inputviaje);
            let ValorXKm = tarifa.priceckilometer * inputviaje.distance
            let ValorXMin = tarifa.priceminute * inputviaje.time
            let valorviaje = ValorXKm + ValorXMin + parseFloat(tarifa.pricebase.toString())
            inputviaje.Total = valorviaje <= tarifa.priceminimun ? tarifa.priceminimun : valorviaje
            let user = await this.getUserDatafromDriver(inputviaje.iddriver);
            let wallet = await this.getWalletFromUser(user.id, inputviaje.idcurrency);

            if (wallet == undefined) {
                /*throw new HttpException(
                    "Error the drive does not have wallet available",
                    HttpStatus.BAD_REQUEST
                );*/
                console.log("Error the drive does not have wallet available");
                return false;
            }
            let getTax = await this.getCountryByDrive(inputviaje.iddriver);
            let tax = (getTax.tax == null) ? 0 : getTax.tax;
            let skiperPorcentagePay = await this.skipercattravelservice.getById(inputviaje.idcategoryTravel);
            let subtotal = (inputviaje.Total * parseInt(skiperPorcentagePay.paycommission.toString())) / 100;
            let calcTax = (subtotal * tax) / 100;
            let totaldebit = subtotal + calcTax;

            if (parseFloat(wallet.amount.toString()) < parseFloat(totaldebit.toFixed(2))) {
                /*throw new HttpException(
                    "Error the drive does not have enough funds",
                    HttpStatus.BAD_REQUEST
                );*/
                console.log("Error the drive does not have enough funds");
                return false;
            }
            return true;
        }
    }

    async GenerateTravel(inputviaje: SkiperTravelsInput, ip: string): Promise<SkiperTravels> {
        //var code = await geoip_lite.lookup(ip)
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
            .getOne();

        var usuario = await this.userService.findById(vehiculo.skiperVehicleAgent[0].skiperAgent.user.id)
        // se rompe aqui
        //console.log(usuario.country.id)
        //console.log(usuario.city.id)
        //console.log(vehiculo.id_cat_travel)
        var tarifa = await this.CalcularTarifa(ip, vehiculo.id_cat_travel, inputviaje.lat_initial, inputviaje.lng_initial)
        //console.log(tarifa)
        //console.log(tarifa);
        //console.log(inputviaje);
        var ValorXKm = tarifa.priceckilometer * inputviaje.distance
        var ValorXMin = tarifa.priceminute * inputviaje.time
        var valorviaje = ValorXKm + ValorXMin + parseFloat(tarifa.pricebase.toString())
        inputviaje.Total = valorviaje <= tarifa.priceminimun ? tarifa.priceminimun : valorviaje


        /* let user = await this.getUserDatafromDriver(inputviaje.iddriver);
         let wallet = await this.getWalletFromUser(user.id, inputviaje.idcurrency);
         if (wallet == undefined) {
             throw new HttpException(
                 "Error the drive does not have wallet available ",
                 HttpStatus.BAD_REQUEST
             );
         }
 
         if (parseFloat(wallet.amount.toString()) < parseFloat(inputviaje.Total.toString())) {
             throw new HttpException(
                 "Error the drive does not have enough funds ",
                 HttpStatus.BAD_REQUEST
             );
         }*/

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

    private async getWalletFromUser(iduser: number, idcurrency: number): Promise<SkiperWallet> {
        return await createQueryBuilder(SkiperWallet, "SkiperWallet")
            .where("SkiperWallet.iduser = :iduser", { iduser })
            .andWhere("SkiperWallet.idcurrency = :idcurrency", { idcurrency })
            .getOne();
    }

    private async getUserDatafromDriver(iddriver: number): Promise<User> {
        try {
            return await createQueryBuilder(User, "User")
                .leftJoin("User.skiperAgent", "SkiperAgent")
                .where("SkiperAgent.id = :iddriver", { iddriver })
                .getOne();
        } catch (error) {
            console.log(error);
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
                "LOCA MANA" + err,
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
                .innerJoinAndSelect("SkiperVehicle.uploadVehicleAppearance", "UploadVehicleAppearance")
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

    async getAllTravel(): Promise<SkiperTravels[]> {
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
                .innerJoinAndSelect("SkiperVehicle.uploadVehicleAppearance", "UploadVehicleAppearance")
                .innerJoinAndSelect("SkiperTravels.skiperTravelsTracing", "SkiperTravelsTracing")
                .innerJoinAndSelect(subQuery => {
                    return subQuery
                        .select("SkiperTravelsTracing.idtravel", "idtravel")
                        .addSelect("MAX(SkiperTravelsTracing.datetracing)", "fecha")
                        .from(SkiperTravelsTracing, "SkiperTravelsTracing")
                        .groupBy("SkiperTravelsTracing.idtravel")
                }, "d", "SkiperTravelsTracing.idtravel = d.idtravel and SkiperTravelsTracing.datetracing = d.fecha")
                .innerJoinAndSelect("SkiperTravelsTracing.travelstatus", "SkiperTravelsStatus")
                //.where("User.id = :iduser", { iduser })
                .where("SkiperTravelsTracing.idtravelstatus IN (:idstatus)", { idstatus: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] })
                .orderBy("SkiperTravels.id", "DESC")
                .getMany()
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
    private async getCountryByDrive(idagent: number): Promise<Countrie> {
        return await createQueryBuilder(Countrie, "Countrie")
            .leftJoin("Countrie.user", "User")
            .leftJoin("User.skiperAgent", "skiperAgent")
            .where("skiperAgent.id = :id", { id: idagent })
            .getOne();
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
        skipertravel.state = input.state;
        skipertravel.idcattravel = input.categoryId;

        console.log(skipertravel)
        return skipertravel;
    }
}
