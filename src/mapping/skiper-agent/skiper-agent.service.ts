import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SkiperAgent } from './skiper-agent.entity';
import { Repository, createQueryBuilder, getConnection } from 'typeorm';
import { AgentInput, AgentDriveInput } from './skiper-agent.dto';
import { UserService } from '../users/user.service';
import { CategoryAgentService } from '../category-agent/category-agent.service';
import { User } from '../users/user.entity';
import { SkiperTravelsService } from '../skiper-travels/skiper-travels.service';
import { SkiperVehicleService } from '../skiper-vehicle/skiper-vehicle.service';
import { SkiperVehicleInput } from '../skiper-vehicle/skiper-vehicle.dto';
import { SkiperVehicleAgentService } from '../skiper-vehicle-agent/skiper-vehicle-agent.service';
import { SkiperVehicleAgentInput } from '../skiper-vehicle-agent/skiper-vehicle-agent.dto';
import { SkiperVehicle } from '../skiper-vehicle/skiper-vehicle.entity';
import { SkiperVehicleAgent } from '../skiper-vehicle-agent/skiper-vehicle-agent.entity';
import { UploadImgAgent } from '../upload-img-agent/upload-img-agent.entity';
import { UploadVehicleAppearance } from '../upload-vehicle-appearance/upload-vehicle-appearance.entity';
import { UploadVehicleLegalDoc } from '../upload-vehicle-legal-doc/upload-vehicle-legal-doc.entity';
import { UploadVehicleAppearanceService } from '../upload-vehicle-appearance/upload-vehicle-appearance.service';
import { UploadVehicleLegalDocService } from '../upload-vehicle-legal-doc/upload-vehicle-legal-doc.service';

require('isomorphic-fetch');

@Injectable()
export class SkiperAgentService {

    constructor(
        @InjectRepository(SkiperAgent) private agentRepository: Repository<SkiperAgent>,
        private readonly userService: UserService,
        private readonly categoryAgentService: CategoryAgentService,
        private readonly skiperTravelsService: SkiperTravelsService,
        private readonly skiperVehicleService: SkiperVehicleService,
        private readonly skipervehicleagent: SkiperVehicleAgentService,
        private readonly uploadvehicleappearanceservice: UploadVehicleAppearanceService,
        private readonly uploadvehiclelegaldocservice: UploadVehicleLegalDocService
    ) { }

    async getAll() {
        return await this.agentRepository.find({ relations: ["user", "categoryAgent"] });
    }

    async getById(id: number) {
        return await this.agentRepository.findOne({
            relations: ["user", "categoryAgent"],
            where: { id: id }
        });
    }

    async GetDistance(origin, destination) {

        const toQueryParams = (object) => {
            return Object.keys(object)
                .filter(key => !!object[key])
                .map(key => key + "=" + encodeURIComponent(object[key]))
                .join("&")
        }

        const ReturnDist = async () => {
            const options = {
                key: "AIzaSyDRc0P0ozp5BU98gDG06OXbFaGk3OiOYxw",
                mode: "Driving"
            };

            const queryParams = {
                origin: origin,
                destination: destination,
                ...options,
            };

            const url = `https://maps.googleapis.com/maps/api/directions/json?${toQueryParams(queryParams)}` + '&language=es';

            var x = await fetch(url)
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
                    return json;
                });
            return x
        }
        return await ReturnDist()
    };

    async ObtenerDriveMasCercano(
        lat: number, lng: number,
        Drives: AgentDriveInput[]): Promise<number> {

        //primero vamos a sacar solos los drive que no se encuentren en ningun viaje
        let DriverDisponibles = [];

        var x = await Promise.all(
            Drives.map(async item => {
                var x = await this.skiperTravelsService.getTravelByAgentId(item.iddrive)
                if (x == undefined)
                    DriverDisponibles.push(item)
            })
        )

        if (DriverDisponibles.length == 0)
            throw new HttpException(
                "No hay Drivers disponibles",
                HttpStatus.BAD_REQUEST
            );

        var t = await Promise.all(DriverDisponibles.map(async item => {
            var Distancia = await this.GetDistance(
                lat.toString() + ',' + lng.toString(),
                item.lat.toString() + ',' + item.lng.toString())
            item.distancia = Distancia.routes[0].legs[0].distance.value
        }))

        var drive = DriverDisponibles.sort(function (element1, element2) { return element1.distancia - element2.distancia })[0]
        return drive.iddrive
    }

    async getByUser(user: User) {
        try {
            return await this.agentRepository.findOne({
                where: { user: user, state: true }
            });
        } catch (error) {
            console.log(error)
        }
    }

    async updateStateAgent(idgent: number) {
        try {
            let search = await this.getById(idgent);
            if (search !== undefined) {
                if (search.state == true) {
                    search.state = false;
                } else {
                    search.state = true;
                }
                return this.agentRepository.save(search);
            }

        } catch (error) {
            console.log(error);
        }
    }

    async searchAgentByIdUser(iduser: number) {
        try {
            return await this.agentRepository.findOneOrFail({
                relations: ["user", "categoryAgent"],
                where: { iduser: iduser }
            });
        } catch (error) {
            const errorMessage = error.error_message || 'There is no agent for the requested user';
            throw new HttpException(
                errorMessage,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async registerCompleteDataAgent(
        firtsname: string,
        lastname: string,
        email: string,
        username: string,
        password: string,
        address: string,
        phone: string,
        idcountry: number,
        idcity: number,
        identity: string,
        license_plate: string,
        idcattravel: number,
        id_vehicle_catalog: number,
        idtrademark: number,
        idmodel: number,
        idyear: number,
        url_img_identity: string,
        url_img_verify_identity: string,
        url_img_letterone_recomendation: string,
        url_img_lettertwo_recomendation: string,
        url_img_driver_license: string,
        url_img_police_record: string,
        url_img_driving_record: string,
        url_img__vehicle_front: string,
        url_img__vehicle_behind: string,
        url_img__vehicle_side_right: string,
        url_img__vehicle_side_left: string,
        url_img__vehicle_inside_one: string,
        url_img__vehicle_inside_two: string,
        url_img__vehicle_inside_three: string,
        url_img__vehicle_inside_four: string,
        url_img_insurance: string,
        url_img_vehicle_circulation: string,
        url_img_mechanical_inspection: string,
        url_img_gas_emission: string,
        url_img_license_plate: string
    ) {
        let errors = { alertPhone: "", alertEmail: "", alertUser: "", alertLicense_Plate: "" };

        let isEmailExist = await this.validateEmailIsExist(email);
        let isLicensePlate = await this.validateLicensePlatenameIsExist(license_plate);
        if (isEmailExist.length == 0) {
            let isPhoneExist = await this.validatePhoneIsExist(phone);
            let isUsernameExist = await this.validateUsernameIsExist(username);

            if (isPhoneExist.length > 0) {
                errors.alertPhone = "Este número de teléfono ya está registrado";
            }
            if (isUsernameExist.length > 0) {
                errors.alertUser = "Este nombre de usuario ya está registrado"
            }
        }
        //console.log(isLicensePlate)
        //console.log(isEmailExist, isEmailExist.length)        
        if (isLicensePlate.length > 0) {
            errors.alertLicense_Plate = "Esta placa ya está registrada"
        }
        if (errors.alertEmail.length > 0 || errors.alertPhone.length > 0 || errors.alertUser.length > 0 || isLicensePlate.length > 0) {
            throw new HttpException(
                errors,
                HttpStatus.BAD_REQUEST
            )
        }
        try {
            let userData;
            let agentData;
            if (isEmailExist.length == 0) {
                userData = await this.registerUser(firtsname, lastname, email, username, password, address, phone, idcountry, idcity);
                console.log(userData.id)
                agentData = await this.registerAgent(userData.id, identity);
            } else {
                userData = await isEmailExist;
                agentData = await this.registerAgent(userData[0].id, identity);
                console.log(agentData)
            }

            if (agentData) {
                await this.registerUploadImageAgent(agentData.id, url_img_identity, url_img_verify_identity, url_img_letterone_recomendation, url_img_lettertwo_recomendation, url_img_driver_license, url_img_police_record, url_img_driving_record)
            }
            let registerVehicle;
            if (license_plate != null && agentData) {
                registerVehicle = await this.registerVehicle(license_plate, idcattravel, id_vehicle_catalog, idtrademark, idmodel, idyear);
            }

            if (agentData && registerVehicle) {
                await this.registerAgentVehicle(agentData.id, registerVehicle.id);
            }

            if (registerVehicle) {
                await this.registerVehicleUploadAppeareance(registerVehicle.id, url_img__vehicle_front, url_img__vehicle_behind, url_img__vehicle_side_right, url_img__vehicle_side_left, url_img__vehicle_inside_one, url_img__vehicle_inside_two, url_img__vehicle_inside_three, url_img__vehicle_inside_four);
            }
            if (registerVehicle) {
                await this.registerVehicleUploadLegalDoc(registerVehicle.id, url_img_gas_emission, url_img_insurance, url_img_license_plate, url_img_mechanical_inspection, url_img_vehicle_circulation);
            }
            return "Exito";
        } catch (error) {
            console.log(error)
        }

    }

    async registerAgentVehicle(agentId: number, vehicleId: number) {
        let connect = getConnection();
        let queryRunner = connect.createQueryRunner();
        queryRunner.connect();
        await queryRunner.startTransaction();
        let result;
        try {
            let skipervehicleAgent = new SkiperVehicleAgent();
            skipervehicleAgent.idagent = agentId;
            skipervehicleAgent.idvehicle = vehicleId;
            skipervehicleAgent.is_owner = 1;
            let skipervehicleagent = await queryRunner.manager.save(skipervehicleAgent);
            await queryRunner.commitTransaction();
            result = await this.skipervehicleagent.getById(skipervehicleagent.id)
        } catch (error) {
            console.log(error)
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
            return result;
        }
    }

    async registerVehicleUploadLegalDoc(vehicleId: number, url_img_gas_emission: string, url_img_insurance: string, url_img_license_plate: string, url_img_mechanical_inspection: string, url_img_vehicle_circulation: string) {
        let connection = getConnection();
        let queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let result;
        try {
            let uploadvehiclelegaldoc = new UploadVehicleLegalDoc();
            uploadvehiclelegaldoc.url_img_gas_emission = url_img_gas_emission;
            uploadvehiclelegaldoc.url_img_insurance = url_img_insurance;
            uploadvehiclelegaldoc.url_img_license_plate = url_img_license_plate;
            uploadvehiclelegaldoc.url_img_mechanical_inspection = url_img_mechanical_inspection;
            uploadvehiclelegaldoc.url_img_vehicle_circulation = url_img_vehicle_circulation;
            uploadvehiclelegaldoc.idvehicle = vehicleId;
            let uploadvehiclelegaldocSaved = await queryRunner.manager.save(uploadvehiclelegaldoc);
            await queryRunner.commitTransaction();
            result = await this.uploadvehiclelegaldocservice.getById(uploadvehiclelegaldocSaved.id);
        } catch (error) {
            console.log(error)
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
            return result;
        }
    }

    async registerVehicleUploadAppeareance(vehicleId: number, url_img_vehicle_front: string, url_img_vehicle_behind: string, url_img_vehicle_side_right: string, url_img_vehicle_side_left: string, url_img_vehicle_inside_one: string, url_img_vehicle_inside_two: string, url_img_vehicle_inside_three: string, url_img_vehicle_inside_four: string) {
        let connection = getConnection();
        let queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let result;
        try {
            let uploadvehicleappeareance = new UploadVehicleAppearance();
            uploadvehicleappeareance.url_img_vehicle_front = url_img_vehicle_front;
            uploadvehicleappeareance.url_img_vehicle_behind = url_img_vehicle_behind;
            uploadvehicleappeareance.url_img_vehicle_side_right = url_img_vehicle_side_right;
            uploadvehicleappeareance.url_img_vehicle_side_left = url_img_vehicle_side_left;
            uploadvehicleappeareance.url_img_vehicle_inside_one = url_img_vehicle_inside_one;
            uploadvehicleappeareance.url_img_vehicle_inside_two = url_img_vehicle_inside_two;
            uploadvehicleappeareance.url_img_vehicle_inside_three = url_img_vehicle_inside_three;
            uploadvehicleappeareance.url_img_vehicle_inside_four = url_img_vehicle_inside_four;
            uploadvehicleappeareance.skiperVehicleId = vehicleId;
            let uploadvehicleappeareanceSaved = await queryRunner.manager.save(uploadvehicleappeareance);

            await queryRunner.commitTransaction();
            result = await this.uploadvehicleappearanceservice.getById(uploadvehicleappeareanceSaved.id);
        } catch (error) {
            console.log(error)
            queryRunner.rollbackTransaction();
        } finally {
            queryRunner.release();
            return result;
        }
    }

    async registerVehicle(license_plate: string, idcatTravel: number, vehicleCatalogId: number, trademarkId: number, modelId: number, yearId: number, ) {
        let connection = getConnection();
        let queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let result;
        try {
            let vehicle = new SkiperVehicle();
            vehicle.license_plate = license_plate;
            vehicle.id_cat_travel = idcatTravel;
            vehicle.id_vehicle_catalog = vehicleCatalogId;
            vehicle.idtrademark = trademarkId;
            vehicle.idmodel = modelId;
            vehicle.idyear = yearId;
            let vehicleSaved = await queryRunner.manager.save(vehicle);

            await queryRunner.commitTransaction();
            result = await this.skiperVehicleService.getById(vehicleSaved.id);
        } catch (error) {
            console.log(error)
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
            return result;
        }
    }

    async registerUploadImageAgent(agentId: number, url_img_identity: string, url_img_verify_identity: string, url_img_letterone_recomendation: string, url_img_lettertwo_recomendation: string, url_img_driver_license: string, url_img_police_record: string, url_img_driving_record: string) {
        let connection = getConnection();
        let queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let result;
        try {
            let uploadingAgent = new UploadImgAgent();
            uploadingAgent.id_skiper_agent = agentId;
            uploadingAgent.url_img_identity = url_img_identity;
            uploadingAgent.url_img_verify_identity = url_img_verify_identity;
            uploadingAgent.url_img_letterone_recomendation = url_img_letterone_recomendation;
            uploadingAgent.url_img_lettertwo_recomendation = url_img_lettertwo_recomendation;
            uploadingAgent.url_img_driver_license = url_img_driver_license;
            uploadingAgent.url_img_police_record = url_img_police_record;
            uploadingAgent.url_img_driving_record = url_img_driving_record;

            let uploadingAgentSaved = await queryRunner.manager.save(uploadingAgent)
            await queryRunner.commitTransaction();

            result = await this.uploadvehicleappearanceservice.getById(uploadingAgentSaved.id);

        } catch (error) {
            console.log(error)
            queryRunner.rollbackTransaction();
        } finally {
            queryRunner.release();
            return result;
        }
    }
    async registerAgent(userId: number, identity: string) {
        let connection = getConnection();
        let queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let result;
        try {
            let agent = new SkiperAgent();
            agent.iduser = userId;
            agent.idcategory_agent = 1;
            agent.state = false;
            agent.identity = identity;
            agent.create_at = new Date();
            let agentSaved = await queryRunner.manager.save(agent);
            await queryRunner.commitTransaction();
            result = await this.getById(agentSaved.id);
        } catch (error) {
            console.log(error)
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
            return result;
        }
    }

    async registerUser(firtsname: string, lastname: string, email: string, username: string, password: string, address: string, phone: string, idcountry: number, idcity: number) {
        let connection = getConnection();
        let queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let result;
        try {
            let user = new User();
            user.firstname = firtsname;
            user.lastname = lastname;
            user.email = email;
            user.user = username;
            user.password = password;
            user.address = address;
            user.phone = phone;
            user.idcountry = idcountry;
            user.idcity = idcity;
            let userSaved = await queryRunner.manager.save(user);
            await queryRunner.commitTransaction();

            result = await this.userService.getUserById(userSaved.id)

        } catch (error) {
            console.log(error)
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
            return result;
        }
    }


    async register(agent: AgentInput) {
        try {
            let user = await this.userService.getUserById(agent.user_id);
            let category = await this.categoryAgentService.getById(agent.categoryAgent_id);
            if (user !== undefined && category !== undefined) {
                let agentInsert: SkiperAgent = SkiperAgentService.parseAgent(agent, user, category);
                return await this.agentRepository.save(agentInsert);
            }
            return null;
        } catch (error) {
            console.log(error)
            return null;
        }
    }

    async delete(idagent: number) {
        try {
            let result = await this.agentRepository.findOne(idagent);
            await this.agentRepository.remove(result);
            return "Agent remove successfully";
        } catch (error) {
            const errorMessage = error.error_message || 'error transaction or agent cannot be removed';
            throw new HttpException(
                errorMessage,
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async update(agent: AgentInput) {
        try {
            let agentUpdate = await this.getById(agent.id);
            if (agentUpdate !== undefined) {
                agentUpdate.state = agent.state;
                return await this.agentRepository.save(agentUpdate);
            }

        } catch (error) {
            console.log(error)
        }
    }
    async validatePhoneIsExist(phone: string) {
        try {
            return await createQueryBuilder("User")
                .where("User.phone = :phone", { phone })
                .getMany();
        } catch (error) {
            console.log
        }
    }

    async validateEmailIsExist(email: string) {
        try {
            return await createQueryBuilder("User")
                .where("User.email = :email", { email })
                .getMany();
        } catch (error) {
            console.log
        }
    }

    async validateUsernameIsExist(user: string) {
        try {
            return await createQueryBuilder("User")
                .where("User.user = :user", { user })
                .getMany();
        } catch (error) {
            console.log
        }
    }

    async validateLicensePlatenameIsExist(license_plate: string) {
        try {
            return await createQueryBuilder("SkiperVehicle")
                .where("SkiperVehicle.license_plate = :license_plate", { license_plate })
                .getMany();
        } catch (error) {
            console.log
        }
    }

    /*
        SELECT ref., c., ci.* FROM users u
        INNER JOIN users ref ON u.id = ref.sponsor_id
        INNER JOIN countries c ON ref.idcountry = c.id
        INNER JOIN cities ci ON ref.idcity = ci.id
        WHERE u.id = 1
    */
    async searchAgentsBySponsorId(iduser: number) {
        try {
            let result = await createQueryBuilder("User")
                .innerJoinAndSelect("User.country", "Country")
                .innerJoinAndSelect("User.city", "City")
                .innerJoinAndSelect("User.skiperAgent", "SkiperAgent")
                // .innerJoinAndSelect("SkiperAgent.user", "UserAgent")
                .innerJoinAndSelect("SkiperAgent.categoryAgent", "CategoryAgent")
                .where("User.sponsor_id = :iduser", { iduser })
                .getMany();
            return result;
        } catch (error) {
            console.log(error)
        }
    }

    public static parseAgent(input: AgentInput, user?, category?): SkiperAgent {
        let agent: SkiperAgent = new SkiperAgent();
        agent.identity = input.identity;
        agent.iduser = input.iduser;
        agent.state = input.state;
        agent.create_at = input.create_at;
        agent.user = user;
        agent.categoryAgent = category;
        return agent;
    }
}