import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../mapping/users/user.service';
import { User } from '../mapping/users/user.entity';

import moment from 'moment';
import * as bcrypt from 'bcryptjs';
import Twilio from 'twilio';
import { createQueryBuilder } from 'typeorm';
import { ErrorResponse, SignResponse, SignInOk, twilioDto, ResetDto } from './auth.dto';
import { UserInput } from '../mapping/users/user.dto';
import { SkiperAgentService } from '../mapping/skiper-agent/skiper-agent.service';
import node_geocoder from 'node-geocoder';
import geotz from 'geo-tz';
import momentTimeZone from 'moment-timezone';

@Injectable()
export class AuthService {

    private logger = new Logger('AuthService');
    private twilio = Twilio('AC73bd022e60925dcb77fd1eee9ba4e7a8', 'f7072ce2913e7d84910f5b8cccd70821');

    constructor(
        private readonly userService: UserService,
        private readonly agentService: SkiperAgentService,
        private readonly jwtService: JwtService
    ) { }

    public async validate(email: string): Promise<User> {
        return await this.userService.findByEmail(email);
    }

    // ------------------------------------------------------------------------------------------
    // Metodo para el login del usuario
    // ------------------------------------------------------------------------------------------
    async login(sign: any, lat: number, long: number): Promise<SignResponse> {
        let result = await this.validate(sign.email);
        let country = await this.userService.getCountryByCordenates(lat, long);

        if (result == undefined) {
            return new SignResponse(null, new ErrorResponse('The email or password is incorrect', 400, false));
        } else {
            if (!bcrypt.compareSync(sign.password, result.password)) {
                return new SignResponse(null, new ErrorResponse('The email or password is incorrect', 400, false));
            }
            let co, ve, wallet, currency;
            let active_city = false;
            try {
                let agent = await this.agentService.getByUser(result);
                if (agent == undefined) {
                    co = null;
                    ve = null;
                    wallet = null;
                    currency = null;
                }
                else {
                    co = await this.commerceByQueryBuilder(result);
                    ve = await this.vehicleByQueryBuilder(result);
                    wallet = await this.walletByQueryBuilder(result);
                    currency = await this.CurrencyByQueryBuilder(country.id)

                }
                if (await this.validateUserInActiveCity(result.id) !== undefined) {
                    active_city = true;
                }
                let t = new SignResponse(new SignInOk(
                    await this.tokenGenerated(result), result.firstname,
                    result.lastname, result.user,
                    result.email, result.phone, result.avatar, result.country, co, ve, wallet, currency, active_city,
                    result.city
                ), null);                
                return t;
            } catch (error) {
                console.log(error)
            }
        }
    }

    // ------------------------------------------------------------------------------------------
    // Metodo para registrar a un usuario
    // ------------------------------------------------------------------------------------------
    public async register(input: UserInput): Promise<SignResponse> {
        let userbysponsor = await this.userService.findById(input.sponsor_id)
        if (userbysponsor == undefined) {
            return new SignResponse(null, new ErrorResponse('Sponsor ID is not valid!', 400, false));
        }

        let result = await this.userService.create(input);
        if (result === null) {
            return new SignResponse(null, new ErrorResponse('This email or phone is already exist in the database!', 400, false));
        }
        return new SignResponse(new SignInOk(
            await this.tokenGenerated(result), result.firstname,
            result.lastname, result.user,
            result.email, result.phone, result.avatar, result.country
        ), null);
    }
    // ------------------------------------------------------------------------------------------
    // Generar token con expiracion de 15 dias
    // ------------------------------------------------------------------------------------------
    async tokenGenerated(newUser: User) {
        const payload = {
            sub: newUser.id,
            exp: moment().add(15, 'days').unix(),
            iat: moment().unix()
        }
        return await this.jwtService.sign(payload);
    }

    async validateUser(payload: any) {
        return await this.userService.findByPayload(payload);
    }

    // ------------------------------------------------------------------------------------------
    // Enviar codigo al numero con la api de twilio
    // ------------------------------------------------------------------------------------------
    async sendCode(body: twilioDto, reset: number = 0): Promise<ErrorResponse> {
        let sendCode;

        if (reset == 0) {
            let userExist = await this.userService.findByPhone(body.phone_number);
            if (userExist) {
                return new ErrorResponse('Phone number is already exist in the database!!', 400, false)
            }
        }

        try {
            // let service= await this.twilio.verify.services.create({friendlyName: 'AlySkiper'})
            // .then(service => console.log(service.sid));
            sendCode = await this.twilio.verify.services('VAa6b9c85190806fea98d792c10a383394')
                .verifications
                .create({
                    to: body.phone_number,
                    channel: body.channel
                })
            // console.log(service);
            return new ErrorResponse('Code verification send successfully', 200, true)
        } catch (error) {
            console.log(error);
            return new ErrorResponse('Max send attempts reached', 429, false)
        }
    }

    // ------------------------------------------------------------------------------------------
    // Verificar codigo que se envio con twilio
    // ------------------------------------------------------------------------------------------
    async verifyCode(body: twilioDto): Promise<ErrorResponse> {
        let verifyCode
        try {
            verifyCode = await this.twilio.verify.services('VAa6b9c85190806fea98d792c10a383394')
                .verificationChecks
                .create({ code: body.code, to: body.phone_number })
            if (verifyCode.status === 'approved') {
                return new ErrorResponse('Code successfully verify', 200, true)
            }
        } catch (error) {
            return new ErrorResponse('Could not send verification code', 200, false)
        }
    }

    // ------------------------------------------------------------------------------------------
    // Reset password
    // ------------------------------------------------------------------------------------------
    async reset(phone_number: string) {
        try {
            let result = await this.userService.findByPhone(phone_number);
            if (result !== undefined) {
                let body = { phone_number: result.phone, channel: 'sms' }
                let message = await this.sendCode(body, 1);
                return new ResetDto(result, message);
            }
            return new ResetDto(null, new ErrorResponse('Phone not exist!!', 200, true));
        } catch (error) {
            return new ResetDto(null, new ErrorResponse('Could not send verification code', 200, true));
        }
    }

    // ------------------------------------------------------------------------------------------
    // Edit password
    // ------------------------------------------------------------------------------------------
    editPassowrd(input: any) {
        let result = this.userService.editPassowrd(input);
        if (result) {
            return new ErrorResponse('Update password successfuly!!', 200, true)
        }
    }

    // ------------------------------------------------------------------------------------------
    // Logout
    // ------------------------------------------------------------------------------------------
    async logout(id: number) {
        return await this.userService.logout(id);
    }

    // ------------------------------------------------------------------------------------------
    // Obtener comercio atravez del id de usuario
    // ------------------------------------------------------------------------------------------
    private async commerceByQueryBuilder(result) {
        let co = await createQueryBuilder("SkiperCommerce")
            .innerJoinAndSelect("SkiperCommerce.skiperAgent", "SkiperAgent")
            .innerJoinAndSelect("SkiperAgent.user", "User")
            .where("SkiperAgent.iduser = :userId", { userId: result.id })
            .getOne();
        return co;
    }

    // ------------------------------------------------------------------------------------------
    // Obtener wallet atravez del id de usuario
    // ------------------------------------------------------------------------------------------
    private async walletByQueryBuilder(result) {
        let sw = await createQueryBuilder("SkiperWallet")
            .innerJoinAndSelect("SkiperWallet.userID", "userID")
            .where("userID.id = :id ", { id: result.id })
            .getOne();
        return sw;
    }

    // ------------------------------------------------------------------------------------------
    // Obtener currency
    // ------------------------------------------------------------------------------------------
    private async CurrencyByQueryBuilder(idcountry: number) {
        let sw = await createQueryBuilder("Currency")
            .where("Currency.idcountry = :idcountry", { idcountry: idcountry })
            .getOne();
        return sw;
    }

    // ------------------------------------------------------------------------------------------
    // Obtener vehiculo atravez del id de usuario
    // ------------------------------------------------------------------------------------------
    private async vehicleByQueryBuilder(result) {
        let ve = await createQueryBuilder("SkiperVehicle")
            .innerJoinAndSelect("SkiperVehicle.skiperCatTravel", "SkiperCatTravel")
            .innerJoinAndSelect("SkiperVehicle.vehicleTrademark", "VehicleTrademark")
            .innerJoinAndSelect("SkiperVehicle.vehicleModel", "VehicleModel")
            .innerJoinAndSelect("SkiperVehicle.vehicleYear", "VehicleYear")
            .innerJoinAndSelect("SkiperVehicle.vehicleCatalog", "VehicleCatalog")
            .innerJoinAndSelect("SkiperVehicle.uploadVehicleAppearance", "UploadVehicleAppearance")
            .innerJoinAndSelect("SkiperVehicle.skiperVehicleAgent", "SkiperVehicleAgent")
            .innerJoinAndSelect("SkiperVehicleAgent.skiperAgent", "SkiperAgent")
            .innerJoin("SkiperAgent.user", "User")
            .where("User.id = :userId", { userId: result.id })
            .getOne();
        return ve;
    }

    private async validateUserInActiveCity(iduser: number) {
        return await createQueryBuilder("User")
            .leftJoin("User.city", "Cities")
            .leftJoin("Cities.appCities", "AppCities")
            .where("User.id = :iduser", { iduser })
            .getOne();
    }
}