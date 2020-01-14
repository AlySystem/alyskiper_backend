import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SkiperVehicle } from './skiper-vehicle.entity';
import { Repository, createQueryBuilder } from 'typeorm';
import { SkiperVehicleInput } from './skiper-vehicle.dto';

@Injectable()
export class SkiperVehicleService {
    constructor(@InjectRepository(SkiperVehicle)
    private readonly repository: Repository<SkiperVehicle>) { }

    async getAll(): Promise<SkiperVehicle[]> {
        try {
            return await this.repository.find({
                relations: ["skiperCatTravel", "vehicleCatalog",
                    "vehicleTrademark", "vehicleModel", "vehicleYear", "uploadVehicleAppearance"]
            });
        } catch (error) {
            throw new HttpException(
                error,
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async getById(id: number): Promise<SkiperVehicle> {
        return await this.repository.findOneOrFail({
            where: { id },
            relations: ["skiperCatTravel", "vehicleCatalog",
                "vehicleTrademark", "vehicleModel", "vehicleYear", "uploadVehicleAppearance"]
        });
    }

    async getVehicleByNumberPlate(numberPlate: string): Promise<SkiperVehicle> {
        try {
            return await this.repository.findOneOrFail({
                relations: ["skiperCatTravel", "vehicleCatalog",
                    "vehicleTrademark", "vehicleModel", "vehicleYear"],
                where: { license_plate: numberPlate }
            });
        } catch (error) {
            throw new HttpException(
                error,
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async getVehicleByUserId(id: number) {
        try {
            let vehicle: any = await createQueryBuilder("SkiperVehicleAgent")
                .innerJoinAndSelect("SkiperVehicleAgent.skiperVehicle", "SkiperVehicle")
                .innerJoinAndSelect("SkiperVehicle.skiperCatTravel", "SkiperCatTravel")
                .innerJoinAndSelect("SkiperVehicle.vehicleCatalog", "VehicleCatalog")
                .innerJoinAndSelect("SkiperVehicle.vehicleTrademark", "VehicleTrademark")
                .innerJoinAndSelect("SkiperVehicle.vehicleModel", "VehicleModels")
                .innerJoinAndSelect("SkiperVehicle.vehicleYear", "VehicleYears")
                .leftJoinAndSelect("SkiperVehicle.uploadVehicleAppearance", "UploadVehicleAppearance")
                .innerJoin("SkiperVehicleAgent.skiperAgent", "SkiperAgent")
                .innerJoin("SkiperAgent.user", "User")
                .where("SkiperAgent.user = :iduser", { iduser: id })
                .getOne();
            return vehicle.skiperVehicle;
        } catch (error) {
            console.log(error)
        }
    }

    async getVehicleBySponsorIdAndCategoryTravelId(id_sponsor: number, cat_travel_id: number = 0) {
        let result;
        if (cat_travel_id != 0) {
            result = await createQueryBuilder("SkiperVehicle")
                .innerJoinAndSelect("SkiperVehicle.skiperCatTravel", "SkiperCatTravel")
                .innerJoinAndSelect("SkiperVehicle.vehicleCatalog", "VehicleCatalog")
                .innerJoinAndSelect("SkiperVehicle.vehicleTrademark", "VehicleTrademark")
                .innerJoinAndSelect("SkiperVehicle.vehicleModel", "VehicleModels")
                .innerJoinAndSelect("SkiperVehicle.vehicleYear", "VehicleYears")
                .innerJoin("SkiperVehicle.skiperVehicleAgent", "SkiperVehicleAgent")
                .innerJoin("SkiperVehicleAgent.skiperAgent", "SkiperAgent")
                .innerJoin("SkiperAgent.user", "User")
                .where("User.sponsor_id = :id_sponsor", { id_sponsor })
                .andWhere("SkiperCatTravel.id = :cat_travel_id", { cat_travel_id })
                .getMany();
        } else {
            result = await createQueryBuilder("SkiperVehicle")
                .innerJoinAndSelect("SkiperVehicle.skiperCatTravel", "SkiperCatTravel")
                .innerJoinAndSelect("SkiperVehicle.vehicleCatalog", "VehicleCatalog")
                .innerJoinAndSelect("SkiperVehicle.vehicleTrademark", "VehicleTrademark")
                .innerJoinAndSelect("SkiperVehicle.vehicleModel", "VehicleModels")
                .innerJoinAndSelect("SkiperVehicle.vehicleYear", "VehicleYears")
                .innerJoin("SkiperVehicle.skiperVehicleAgent", "SkiperVehicleAgent")
                .innerJoin("SkiperVehicleAgent.skiperAgent", "SkiperAgent")
                .innerJoin("SkiperAgent.user", "User")
                .where("User.sponsor_id = :id_sponsor", { id_sponsor })
                // .andWhere("SkiperCatTravel.id = :cat_travel_id",{ cat_travel_id })
                .getMany();
        }
        return result;
    }

    async registerSkiperVehicle(input: SkiperVehicleInput): Promise<SkiperVehicle> {
        try {
            let skipervehicle = this.parseSkipeVehicle(input);
            return await this.repository.save(skipervehicle);
        } catch (error) {
            throw new HttpException(
                'Duplicate entry for key licence_plate, value already exist in the database',
                // error.message,
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async updateSkiperVehicle(input: SkiperVehicleInput): Promise<SkiperVehicle> {
        try {
            let skipervehicle = await this.getById(input.id);
            skipervehicle.license_plate = input.license_plate;
            skipervehicle.skiperCatTravel.id = input.IdCatTravel;
            skipervehicle.vehicleCatalog.id = input.IdVehiclecatalog;
            skipervehicle.vehicleTrademark.id = input.IdTrademark;
            skipervehicle.vehicleModel.id = input.IdModel;
            skipervehicle.vehicleYear.id = input.IdYear;
            skipervehicle.lat = input.lat == undefined ? "" : input.lat;
            skipervehicle.lon = input.lon == undefined ? "" : input.lon;
            return await this.repository.save(skipervehicle);
        } catch (error) {
            throw new HttpException(
                error,
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async updateSkiperVehicleCatTravel(idVehicle: number, idCatTravel: number): Promise<SkiperVehicle> {
        try {
            let skipervehicle = await this.getById(idVehicle);

            /*let newSkiperCatTravel = await createQueryBuilder("SkiperCatTravel")
            .where("SkiperCatTravel.id = :id", {id:idCatTravel})
            .getOne();

            if(!newSkiperCatTravel){
                console.log("CatTravel no encontrado")
                return;
            }
            */

            skipervehicle.id_cat_travel = idCatTravel;
            skipervehicle.skiperCatTravel.id = idCatTravel;
            
            return await this.repository.save(skipervehicle);
        } catch (error) {
            throw new HttpException(
                error,
                HttpStatus.BAD_REQUEST
            )
        }
    }

    private parseSkipeVehicle(input: SkiperVehicleInput): SkiperVehicle {
        let skipervehicle: SkiperVehicle = new SkiperVehicle();
        skipervehicle.id = input.id;
        skipervehicle.license_plate = input.license_plate;
        skipervehicle.id_cat_travel = input.IdCatTravel;
        skipervehicle.id_vehicle_catalog = input.IdVehiclecatalog;
        skipervehicle.idtrademark = input.IdTrademark;
        skipervehicle.idmodel = input.IdModel;
        skipervehicle.idyear = input.IdYear;
        skipervehicle.lat = input.lat == undefined ? "" : input.lat;
        skipervehicle.lon = input.lon == undefined ? "" : input.lon;
        return skipervehicle;
    }
}
