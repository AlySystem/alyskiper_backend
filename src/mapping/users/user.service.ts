import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { User } from './user.entity';
import { Repository, createQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInput, UserUpdatePassword, UserUpdateInput, ChangePasswordEmailInput } from './user.dto';
import { CitiesService } from '../cities/cities.service';
import { CountrieService } from '../countries/countrie.service';
import { UserCivilStatusService } from '../user-civil-status/user-civil-status.service';
import * as bcrypt from 'bcryptjs';
import { Length } from 'class-validator';

@Injectable()
export class UserService {

    private logger = new Logger('UserService');

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly city: CitiesService,
        private readonly country: CountrieService,
        private readonly civil: UserCivilStatusService
    ) { }

    async getAll(): Promise<User[]> {
        try {
            return await this.userRepository.find({ relations: ["country", "city"] });
        } catch (error) {
            console.log(error)
        }
    }

    async getLastUsers(): Promise<User[]> {
        try {
            return await this.userRepository.find({
                relations: ["country", "city"],
                order: { id: 'DESC' },
                take: 20
            });
        } catch (error) {
            console.log(error)
        }
    }

    async getLastUsersByCategoryId(limit: number, categoryId: number) {
        let query = createQueryBuilder("User")
            .leftJoinAndSelect("User.country", "Countrie")
            .leftJoinAndSelect("User.city", "Cities")
            .leftJoinAndSelect("User.skiperAgent", "SkiperAgent")
            .leftJoinAndSelect("User.skiperWallet", "SkiperWallet")

        if (limit)
            query.take(limit)

        if (categoryId)
            query.where("SkiperAgent.categoryAgent = :categoryId", { categoryId: categoryId })



        return await query.orderBy("User.id", "DESC").getMany()

    }

    async findById(id: number) {
        let result: any = await createQueryBuilder("User")
            .leftJoinAndSelect("User.country", "Countrie")
            .leftJoinAndSelect("User.city", "Cities")
            .leftJoinAndSelect("User.skiperAgent", "SkiperAgent")
            .leftJoinAndSelect("SkiperAgent.categoryAgent", "CategoryAgent")
            .where("User.id = :iduser", { iduser: id })
            .getOne();
        return result;
    }

    async getUserById(id: number) {
        return await this.userRepository.findOneOrFail({ id });
    }

    async findBySponsorId(id: number) {
        return await this.userRepository.find({
            where: { sponsor_id: id },
            relations: ["country", "city"]
        });
    }

    async GetUserWalletsCrypto(id: number) {
        /*
        const url = `https://api.coinmarketcap.com/v1/ticker/${result.skiperWallet[0].currencyID.name}/`;
                var cryptodate = await fetch(url)
                    .then(response => response.json())
                    .then(json => {
                        return json;
                    });
        */
        let result = await createQueryBuilder("User")
            .innerJoinAndSelect("User.skiperWallet", "SkiperWallet")
            .innerJoinAndSelect("SkiperWallet.currencyID", "Currency")
            .innerJoinAndSelect("SkiperWallet.countryID", "Countrie")
            .where("User.id = :iduser", { iduser: id })
            .andWhere("Currency.isCrypto = 1")
            .getOne();
        return result;
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
    async userPages(page: number = 1): Promise<User[]> {
        const countries = await this.userRepository.find({
            take: 25,
            skip: 25 * (page - 1),
            order: { id: 'ASC' }
        });
        return countries;
    }

    async findByPhone(phone: string): Promise<User> {
        return await this.userRepository.findOne({ where: { phone: phone } });
    }

    async findByEmail(email: string): Promise<User> {
        return await this.userRepository.createQueryBuilder("User")
            .leftJoinAndSelect("User.country", "Countrie")
            .leftJoinAndSelect("User.city", "Cities")
            .leftJoinAndSelect("User.civilStatus", "CivilStatus")
            .where("User.email = :email", { email })
            .getOne();
    }

    async create(input: UserInput) {
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
                let user: User = UserService.parseUser(input, city, country, civil_status);
                return await this.userRepository.save(user);
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    //Update a user
    async update(input: UserUpdateInput): Promise<User> {
        try {
            let userUpdate = await await this.userRepository.findOneOrFail({ where: { id: input.id } });
            userUpdate.firstname = input.firstname;
            userUpdate.lastname = input.lastname;
            userUpdate.user = input.username;
            userUpdate.email = input.email;
            userUpdate.phone = input.phone;
            userUpdate.avatar = input.avatar;
            userUpdate.country = await this.country.getById(input.country_id);
            userUpdate.city = await this.city.getById(input.city_id);
            return await this.userRepository.save(userUpdate);
        } catch (error) {
            console.log(error)
        }
    }

    async updatePassword(input: UserUpdatePassword) {
        try {
            let result = await this.userRepository.findOneOrFail({ where: { id: input.id } });
            if (!bcrypt.compareSync(input.oldPassword, result.password)) {
                return null;
            }
            result.password = await bcrypt.hash(input.newPassword, parseInt(process.env.SALT));
            return await this.userRepository.save(result);

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
                let result = await this.userRepository.findOne({ where: { email: input.email } });
                if (result) {
                    result.password = await bcrypt.hash(input.password, parseInt(process.env.SALT));
                    let user = await this.userRepository.save(result)
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

    async editPassowrd(input: UserUpdatePassword) {
        try {
            let result = await this.userRepository.findOneOrFail({ where: { id: input.id } });
            result.password = await bcrypt.hash(input.newPassword, parseInt(process.env.SALT));
            return await this.userRepository.save(result);
        } catch (error) {
            console.log(error)
        }
    }

    async defaultPassword(id: number) {
        try {
            let result = await this.userRepository.findOneOrFail({ id });
            result.password = await bcrypt.hash("alyskiper2019", parseInt(process.env.SALT));
            result = await this.userRepository.save(result);
            return 'Success'
        } catch (error) {
            console.log(error)
        }
    }

    async updateOnlineStatus(user: User) {
        try {
            user.is_online = true;
            let result = await this.userRepository.save(user);
            return result;
        } catch (error) {
            console.log(error)
        }
    }

    async updateAvatarImage(id: number, image: string) {
        try {
            let user = await this.findById(id);
            user.avatar = image;
            return await this.userRepository.save(user);
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
            let result = await this.userRepository.save(user);
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
        return await this.userRepository.findOne({ user })
    }

    // Metodo para parsear de UserInput a User
    public static parseUser(input: UserInput, city?, country?, civil_status?): User {
        let user: User = new User();
        user.firstname = input.firstname;
        user.lastname = input.lastname;
        user.sponsor_id = input.sponsor_id;
        user.is_online = false;
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