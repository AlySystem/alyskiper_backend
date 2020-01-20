import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SkiperTariffs } from './skiper-tariffs.entity';
import { Repository } from 'typeorm';
import { SkiperTariffsInput, TariffBatchLog } from './skiper-tariffs.dto';
import { SkiperDriverScheduleService } from '../skiper-driver-schedule/skiper-driver-schedule.service';
import { SkiperCatTravelsService } from '../skiper-cat-travels/skiper-cat-travels.service';
import { CountrieService } from '../countries/countrie.service';
import { CitiesService } from '../cities/cities.service';


@Injectable()
export class SkiperTariffsService {
    constructor(
        @InjectRepository(SkiperTariffs) private readonly repository: Repository<SkiperTariffs>,
        private readonly scheduleService: SkiperDriverScheduleService,
        private readonly catTravelService: SkiperCatTravelsService,
        private readonly countryService: CountrieService,
        private readonly cityService: CitiesService
    ) { }

    async getAll(): Promise<SkiperTariffs[]> {
        try {
            return await this.repository.find({
                relations: ["cities", "countrie", "driverShedule", "skiperCatTravel"]
            })
        } catch (err) {
            throw new HttpException(
                err,
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async findById(id: number): Promise<SkiperTariffs> {
        try {
            return await this.repository.findOneOrFail({
                where: { id: id },
                relations: ["cities", "countrie", "driverShedule", "skiperCatTravel"]
            })
        } catch (err) {
            throw new HttpException(
                err,
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async findByCountryId(idCountry: number): Promise<SkiperTariffs[]> {
        try {
            return await this.repository.find({
                where: { countrie: { id: idCountry } },
                relations: ["cities", "countrie", "driverShedule", "skiperCatTravel"]
            })
        } catch (err) {
            throw new HttpException(
                err,
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async findWithFilters(idCountry: number, idCity: number, idSchedule: number, idCatTravel: number): Promise<SkiperTariffs[]> {
        try {
            console.log("Entro al Find")
            let where: any = {}
            if (idCountry)
                where.countrie = { id: idCountry }

            if (idCity)
                where.cities = { id: idCity }

            if (idSchedule)
                where.driverShedule = { id: idSchedule }

            if (idCatTravel)
                where.skiperCatTravel = { id: idCatTravel }

            console.log("El where")
            console.log(where)
            console.log({ where })
            return await this.repository.find({
                where,
                relations: ["cities", "countrie", "driverShedule", "skiperCatTravel"]
            })
        } catch (err) {
            console.log("Error")
            throw new HttpException(
                err,
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async update(input: SkiperTariffsInput): Promise<SkiperTariffs> {
        try {
            let actualRow = await this.findById(input.id)
            actualRow.price_base = input.price_base
            actualRow.price_kilometer = input.price_kilometer
            actualRow.price_minimum = input.price_minimum
            actualRow.price_minute = input.price_minute
            actualRow.symbol = input.symbol
            console.log("IDK")
            actualRow.driverShedule = await this.scheduleService.getById(input.idDriverSchedule)
            actualRow.cities = await this.cityService.getById(input.idCity)
            actualRow.countrie = await this.countryService.getById(input.idCountry)
            actualRow.skiperCatTravel = await this.catTravelService.getById(input.idSkiperCatTravels)

            return await this.repository.save(actualRow)
        } catch (err) {
            console.log("El error")
            console.log(err)
            throw new HttpException(
                err,
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async insert(input: SkiperTariffsInput): Promise<SkiperTariffs> {
        try {
            let actualRow = new SkiperTariffs()
            actualRow.price_base = input.price_base
            actualRow.price_kilometer = input.price_kilometer
            actualRow.price_minimum = input.price_minimum
            actualRow.price_minute = input.price_minute
            actualRow.symbol = input.symbol

            actualRow.driverShedule = await this.scheduleService.getById(input.idDriverSchedule)
            actualRow.cities = await this.cityService.getById(input.idCity)
            actualRow.countrie = await this.countryService.getById(input.idCountry)
            actualRow.skiperCatTravel = await this.catTravelService.getById(input.idSkiperCatTravels)

            return await this.repository.save(actualRow)
        } catch (err) {
            throw new HttpException(
                err,
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async batchInsert(input: SkiperTariffsInput[]): Promise<TariffBatchLog[]> {
        let log = new Array<TariffBatchLog>()

        for (let index = 0; index < input.length; index++) {
            let l = new TariffBatchLog()
            l.tariffInput = JSON.stringify(input[index])
            try {
                await this.insert(input[index])
                l.status = "Inserted"
            } catch (err) {
                l.error=err
                l.status="Error"
            }
            log.push(l)
        }

        return log
    }
}
