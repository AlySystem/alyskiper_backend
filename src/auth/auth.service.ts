import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../mapping/users/user.service';
import { User } from '../mapping/users/user.entity';

import moment from 'moment';
import * as bcrypt from 'bcryptjs';
import { signInDto, singUpDto } from './dto/signIn.dto';

@Injectable()
export class AuthService {

    private logger = new Logger('AuthService');

    //Dependencies Injection from constructor in AuthService
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ){}

    //Validate data of user
    private async validate(sign: signInDto): Promise<User | any> {
        const result = await this.userService.findByEmail(sign.email);
        if(result !== undefined){
            return result;
        }else{
            return result;
        }
    }

    //Validate info from login from user
    public async login(sign: signInDto): Promise<any | { status: number }> {
        return this.validate(sign).then(async (result) => {
            if(result === undefined){
                return {data: { error: { message: 'The email or password is incorrect', status: 200, ok: false }}}
            }else{
                if (!result) {
                    return {
                        data: { error: { message: 'The email or password is incorrect', status: 200, ok: false }}
                    }
                }
                
                if (!bcrypt.compareSync(sign.password, result.password)) {
                    return {
                        data: { error: { message: 'The email or password is incorrect', status: 200, ok: false }}
                    }
                }
                return {
                    data: {
                        message: 'User logged in correctly',
                        status: 200,
                        ok: true, 
                        error: [],
                        data: {
                            token: await this.tokenGenerated(result),
                            name: result.firstname,
                            lastname: result.lastname,
                            username: result.user,
                            email:result.email,
                            country: result.country,
                            phone_number: result.phone
                        }
                    }
                }
            }
        });
    }
    
    public async register(user: singUpDto): Promise<any> {
        const result = await this.userService.create(user);
        if(result){
            return {
                data: {
                    message: 'User register correctly',
                    status: 200,
                    ok: true, 
                    error: [],
                    data: {
                        token: await this.tokenGenerated(result),
                        name: result.firstname,
                        lastname: result.lastname,
                        username: result.user,
                        email:result.email,
                        country: result.country,
                        phone_number: result.phone
                    }
                }
            }
        }else{
            return {
                data: { error: { message: 'The email or password is incorrect', status: 200, ok: false }}
            } 
        }
    }
    
    //Probando la validacion de las rutas
    async validateUser(payload: any){
        return await this.userService.findByPayload(payload);
    }

    async tokenGenerated(newUser: User) {
        const payload = {
          sub: newUser.id,
          exp: moment().add(15, 'days').unix(),
          iat: moment().unix()
        }
        // this.logger.debug('Generacion - fecha de inicio: '+payload.iat);
        // this.logger.debug('Generacion - fecha de expiracion: '+payload.exp);
        return await this.jwtService.sign(payload);
    }
}