import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { Employes } from './employes.entity';
import { Repository, createQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployesInput, EmployesUpdatePassword, EmployesUpdateInput, ChangePasswordEmailInput } from './employes.dto';
import { CitiesService } from '../cities/cities.service';
import { CountrieService } from '../countries/countrie.service';
import { UserCivilStatusService } from '../user-civil-status/user-civil-status.service';
import * as bcrypt from 'bcryptjs';
import { Length } from 'class-validator';

@Injectable()
export class EmployesService {

    private logger = new Logger('UserService');

    constructor(
        @InjectRepository(Employes) private readonly employesRepository: Repository<Employes>,
        private readonly city: CitiesService,
        private readonly country: CountrieService,
        private readonly civil: UserCivilStatusService
    ) { }

    async getAll(): Promise<Employes[]> {
        try {
            return await this.employesRepository.find({ relations: ["country", "city"] });
        } catch (error) {
            console.log(error)
        }
    }

    async findById(id: number) {
        let result: any = await createQueryBuilder("Employes")
            .leftJoinAndSelect("Employes.country", "Countrie")
            .leftJoinAndSelect("Employes.city", "Cities")
            .leftJoinAndSelect("Employes.skiperAgent", "SkiperAgent")
            .leftJoinAndSelect("SkiperAgent.categoryAgent", "CategoryAgent")
            .where("User.id = :iduser", { iduser: id })
            .getOne();
        return result;
    }

    async getEmployeById(id: number) {
        return await this.employesRepository.findOneOrFail({ id });
    }

    async findBySponsorId(id: number) {
        return await this.employesRepository.find({
            where: { sponsor_id: id },
            relations: ["country", "city"]
        });
    }

    async GetUserWallets(id: number) {
        let result: any = await createQueryBuilder("User")
            .innerJoinAndSelect("User.skiperWallet", "SkiperWallet")
            .innerJoinAndSelect("SkiperWallet.currencyID", "Currency")
            .innerJoinAndSelect("SkiperWallet.countryID", "Countrie")
            .where("User.id = :iduser", { iduser: id })
            .getOne();
        return result;
    }

    //Usando paginacion para cargar los usuarios
    async userPages(page: number = 1): Promise<Employes[]> {
        const countries = await this.employesRepository.find({
            take: 25,
            skip: 25 * (page - 1),
            order: { id: 'ASC' }
        });
        return countries;
    }

    async findByPhone(phone: string): Promise<Employes> {
        return await this.employesRepository.findOne({ where: { phone: phone } });
    }

    async findByEmail(email: string): Promise<Employes> {
        return await this.employesRepository.createQueryBuilder("User")
            .leftJoinAndSelect("User.country", "Countrie")
            .leftJoinAndSelect("User.city", "Cities")
            .leftJoinAndSelect("User.civilStatus", "CivilStatus")
            .where("User.email = :email", { email })
            .getOne();
    }

    async create(input: EmployesInput) {
        let city;
        let civil_status;
        try {

            if (input.city_id !== undefined && input.idcivil_status !== undefined) {
                city = await this.city.getById(input.city_id);
                civil_status = await this.civil.getById(input.idcivil_status);
            } else {
                city = null;
                civil_status = null;
            }
            let country = await this.country.getById(input.country_id);
            if (city !== undefined && country !== undefined && civil_status !== undefined) {
                let employe: Employes = EmployesService.parseUser(input, city, country, civil_status);
                return await this.employesRepository.save(employe);
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    //Update a user
    async update(input: EmployesUpdateInput): Promise<Employes> {
        try {
            console.log(input)
            let userUpdate = await await this.employesRepository.findOneOrFail({ where: { id: input.id } });
            console.log(userUpdate)
            userUpdate.firstname = input.firstname;
            userUpdate.lastname = input.lastname;
            userUpdate.user = input.username;
            userUpdate.email = input.email;
            userUpdate.phone = input.phone;
            userUpdate.avatar = input.avatar;
            userUpdate.country = await this.country.getById(input.country_id);
            userUpdate.city = await this.city.getById(input.city_id);
            return await this.employesRepository.save(userUpdate);
        } catch (error) {
            console.log(error)
        }
    }

    async updatePassword(input: EmployesUpdatePassword) {
        try {
            let result = await this.employesRepository.findOneOrFail({ where: { id: input.id } });
            if (!bcrypt.compareSync(input.oldPassword, result.password)) {
                return null;
            }
            result.password = await bcrypt.hash(input.newPassword, parseInt(process.env.SALT));
            return await this.employesRepository.save(result);

        } catch (error) {
            console.log(error)
        }
    }
    //actualizo
    async updatePasswordByEmail(input: ChangePasswordEmailInput): Promise<number> {
        try {
            if (input.password != input.repeatpassword) {
                return 0;
            } else {
                let result = await this.employesRepository.findOne({ where: { email: input.email } });
                if (result) {
                    result.password = await bcrypt.hash(input.password, parseInt(process.env.SALT));
                    let user = await this.employesRepository.save(result)
                    if (user) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
                return 0;
            }
        } catch (error) {
            console.log(error);
        }
    }

    async editPassowrd(input: EmployesUpdatePassword) {
        try {
            let result = await this.employesRepository.findOneOrFail({ where: { id: input.id } });
            result.password = await bcrypt.hash(input.newPassword, parseInt(process.env.SALT));
            return await this.employesRepository.save(result);
        } catch (error) {
            console.log(error)
        }
    }

    async defaultPassword(id: number) {
        try {
            let result = await this.employesRepository.findOneOrFail({ id });
            result.password = await bcrypt.hash("alyskiper2019", parseInt(process.env.SALT));
            result = await this.employesRepository.save(result);
            return 'Success'
        } catch (error) {
            console.log(error)
        }
    }

    /* async updateOnlineStatus(employe: Employes) {
         try {
             user.is_online = true;
             let result = await this.employesRepository.save(user);
             return result;
         } catch (error) {
             console.log(error)
         }
     }*/

    async updateAvatarImage(id: number, image: string) {
        try {
            let user = await this.findById(id);
            user.avatar = image;
            return await this.employesRepository.save(user);
        } catch (error) {
            console.log(error);
        }
    }

    async getAvatarImage(id: number) {
        try {
            let user = await this.findById(id);
            if (user) {
                return user.avatar;
            }
            return 'Usuario no existe'
        } catch (error) {
            console.log(error)
        }
    }

    async logout(id: number) {
        try {
            let user = await this.findById(id);
            user.is_online = false;
            let result = await this.employesRepository.save(user);
            return (result) ? true : false;
        } catch (error) {
            console.log(error);
        }
    }

    async getUserWhenAddressNullAndSkiperAgentIdNull() {
        let result = await createQueryBuilder("User")
            .leftJoin("User.skiperAgent", "Agent")
            .where("Agent.id IS NULL")
            .andWhere("User.address IS NULL")
            .getMany();
        console.log(result);
        return result;
    }

    async findByPayload(payload: any) {
        const { user } = payload;
        return await this.employesRepository.findOne({ user })
    }

    // Metodo para parsear de UserInput a User
    public static parseUser(input: EmployesInput, city?, country?, civil_status?): Employes {
        let user: Employes = new Employes();
        user.firstname = input.firstname;
        user.lastname = input.lastname;
        user.email = input.email;
        user.user = input.user;
        user.password = input.password;
        user.address = input.address;
        user.phone = input.phone;
        user.create_at = input.create_at;
        user.date_birth = input.date_birth;
        user.avatar = input.avatar;
        user.city = city;
        user.country = country;
        user.civilStatus = civil_status;
        return user;
    }
}