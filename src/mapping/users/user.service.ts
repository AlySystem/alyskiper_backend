import { Injectable, Logger, HttpException, HttpStatus, forwardRef, Inject, Response } from '@nestjs/common';
import { User } from './user.entity';
import { Repository, createQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInput, UserUpdatePassword, UserUpdateInput, ChangePasswordEmailInput, UserDto, CryptosDto } from './user.dto';
import { CitiesService } from '../cities/cities.service';
import { CountrieService } from '../countries/countrie.service';
import { UserCivilStatusService } from '../user-civil-status/user-civil-status.service';
import * as bcrypt from 'bcryptjs';
import { Length, IsEmpty } from 'class-validator';
import { citiesDto } from 'src/mapping/cities/cities.dto';
import { SkiperWallet } from '../skiper-wallet/skiper-wallet.entity';
import { SkiperWalletCryptoDto, pruebaDto, Bitcoin, Ethereum, LiteCoin, Dash, Alycoin } from '../skiper-wallet/skiper-wallet.dto';
import { SkiperWalletService } from '../skiper-wallet/skiper-wallet.service';
import momentTimeZone from 'moment-timezone';
import geotz from 'geo-tz';
import { Countrie } from '../countries/countrie.entity';
import { Currency } from '../currency/currency.entity';
import { MailerService } from '@nest-modules/mailer';
import node_geocoder from 'node-geocoder';
import moment = require('moment');
const rp = require('request-promise');
let gpc = require('generate-pincode');

@Injectable()
export class UserService {

    private logger = new Logger('UserService');


    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @Inject(forwardRef(() => SkiperWalletService))
        private readonly skiperwalletservice: SkiperWalletService,
        private readonly city: CitiesService,
        private readonly country: CountrieService,
        private readonly civil: UserCivilStatusService,
        private readonly mailerService: MailerService

    ) { }

    async getCountryByCordenates(lat: number, long: number) {
        var options = {
            provider: 'google',
            httpAdapter: 'https', // Default
            apiKey: 'AIzaSyDJqxifvNO50af0t6Y9gaPCJ8hYtkbOmQ8', // for Mapquest, OpenCage, Google Premier
            formatter: 'json' // 'gpx', 'string', ...
        };
        var geocoder = node_geocoder(options);
        let zonahoraria = geotz(lat, long)
        let date = momentTimeZone().tz(zonahoraria.toString()).format("YYYY-MM-DD")
        var datecountry = await geocoder.reverse({ lat: lat, lon: long });
        return await this.country.getCountrieByName(datecountry[0].country);
    }

    async validateCode(email: string, code: number, lat: number, long: number) {
        let zonahoraria = geotz(lat, long);
        let date = momentTimeZone().tz(zonahoraria.toString()).format("YYYY-MM-DD HH:mm:ss");
        let verifycode = await createQueryBuilder(User, "User")
            .where("User.email=:email", { email: email })
            .andWhere("User.pin =:pin", { pin: code })
            .andWhere("User.resetPasswordExpires > :resetPasswordExpires", { resetPasswordExpires: date })
            .getOne();
        if (verifycode !== undefined) {
            return true;
        }
        return false;
    }

    async  sendPinByMail(email: string, lat: number, long: number) {
        let zonahoraria = geotz(lat, long);
        let datebruto = momentTimeZone().tz(zonahoraria.toString()).format("YYYY-MM-DD HH:mm:ss");
        let date = Date.parse(datebruto) + 300000;
        let verifyEmail = await createQueryBuilder(User, "User")
            .where("User.email=:email", { email: email }).getOne();
        if (verifyEmail != undefined) {
            let pin = gpc(6);
            verifyEmail.pin = pin;
            verifyEmail.resetPasswordExpires = moment(date).format("YYYY-MM-DD HH:mm:ss");
            let savePin = await this.userRepository.save(verifyEmail);
            if (savePin) {
                return this
                    .mailerService
                    .sendMail({
                        to: verifyEmail.email,
                        from: 'gerencia@alysystem.com',
                        subject: 'Has recibido un pin de seguridad ✔',
                        template: 'sendcodepin',
                        context: {
                            code: pin,
                            username: verifyEmail.firstname,
                        }
                    })
                    .then((result) => {
                        if (result) {
                            return "send successfully"
                        }
                        throw new HttpException(
                            "Error email not sent",
                            HttpStatus.BAD_REQUEST
                        )
                    })
                    .catch((error) => { console.log(error) });
            } else {
                throw new HttpException(
                    "Error code not sent",
                    HttpStatus.BAD_REQUEST
                )
            }

        } else {
            throw new HttpException(
                "Error email not exist",
                HttpStatus.BAD_REQUEST
            )
        }
    }

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

    async getLastSkiperUsers(limit: number) {

        let agents = createQueryBuilder("SkiperAgent")
            .select("SkiperAgent.iduser")

        let query = createQueryBuilder("User")
            .leftJoinAndSelect("User.country", "Countrie")
            .leftJoinAndSelect("User.city", "Cities")
            //.leftJoinAndSelect("User.skiperAgent", "SkiperAgent")
            .leftJoinAndSelect("User.skiperWallet", "SkiperWallet")
            .where("User.id NOT IN (" + agents.getSql() + ")")
        if (limit)
            query.take(limit)

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

    async GetUserWalletsCrypto(id: number, lat: number, long: number) {
        var options = {
            provider: 'google',
            httpAdapter: 'https', // Default
            apiKey: 'AIzaSyDJqxifvNO50af0t6Y9gaPCJ8hYtkbOmQ8', // for Mapquest, OpenCage, Google Premier
            formatter: 'json' // 'gpx', 'string', ...
        };
        var geocoder = node_geocoder(options);
        var datecountry = await geocoder.reverse({ lat: lat, lon: long })


        let currencies = createQueryBuilder(Currency, "Currency")
            .andWhere("Currency.isCrypto = 1").getMany();
        let bitcoin = this.getAmountByNameCurrency("BTC", id);
        let ethereum = this.getAmountByNameCurrency("ETH", id);
        let litecoin = this.getAmountByNameCurrency("LTC", id);
        let dash = this.getAmountByNameCurrency("DASH", id);
        let alycoin = this.getAmountByNameCurrency("ALY", id);

        let country = this.country.getCountrieByName(datecountry[0].country);
        let zonahoraria = geotz(lat, long)
        let date = momentTimeZone().tz(zonahoraria.toString()).format("YYYY-MM-DD")
        let exchange = this.skiperwalletservice.getExchange((await country).nicename, date);
        return Promise.all([exchange, currencies, bitcoin, ethereum, litecoin, dash, alycoin]).then(async result => {
            let bitcoin = new Bitcoin();
            bitcoin.id = result[1][0].id;
            bitcoin.name = result[1][0].name;
            bitcoin.url_img = result[1][0].url_img;
            bitcoin.amount_crypto = result[2].amount;
            bitcoin.price_usd = result[2].price_usd;
            let btc_local = bitcoin.price_usd * result[0].value
            bitcoin.price_local = parseFloat(btc_local.toFixed(2));
            bitcoin.price_crypto = result[2].price_crypto;

            let ethereum = new Ethereum();
            ethereum.id = result[1][1].id;
            ethereum.name = result[1][1].name;
            ethereum.url_img = result[1][1].url_img;
            ethereum.amount_crypto = result[3].amount;;
            ethereum.price_usd = result[3].price_usd;
            let eth_local = ethereum.price_usd * result[0].value
            ethereum.price_local = parseFloat(eth_local.toFixed(2));
            ethereum.price_crypto = result[3].price_crypto;

            let litecoin = new LiteCoin();
            litecoin.id = result[1][2].id;
            litecoin.name = result[1][2].name;
            litecoin.url_img = result[1][2].url_img;
            litecoin.amount_crypto = result[4].amount;
            litecoin.price_usd = result[4].price_usd;
            let lite_local = litecoin.price_usd * result[0].value
            litecoin.price_local = parseFloat(lite_local.toFixed(2));
            litecoin.price_crypto = result[4].price_crypto;

            let dash = new Dash();
            dash.id = result[1][3].id;
            dash.name = result[1][3].name;
            dash.url_img = result[1][3].url_img;
            dash.amount_crypto = result[5].amount;
            dash.price_usd = result[5].price_usd;
            let dash_local = dash.price_usd * result[0].value
            dash.price_local = parseFloat(dash_local.toFixed(2));
            dash.price_crypto = result[5].price_crypto;

            // let alycoin = new Alycoin();
            let alycoin = new Alycoin();
            alycoin.id = result[1][4].id;
            alycoin.name = result[1][4].name;
            alycoin.url_img = result[1][4].url_img;
            alycoin.amount_crypto = result[6].amount;
            alycoin.price_usd = result[6].price_usd;
            let aly_local = alycoin.price_usd * result[0].value
            alycoin.price_local = parseFloat(aly_local.toFixed(2));
            alycoin.price_crypto = result[6].price_crypto;

            let cryptosDto = new CryptosDto();
            cryptosDto.bitcoin = bitcoin;
            cryptosDto.alycoin = alycoin;
            cryptosDto.dash = dash;
            cryptosDto.ethereum = ethereum;
            cryptosDto.litecoin = litecoin;
            console.log(cryptosDto)
            return cryptosDto;
        })

    }

    async getAmountByNameCurrency(crypto: string, id: number) {

        const requestOptions = {
            method: 'GET',
            uri: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${crypto}`,
            qs: {
                'convert': 'USD'
            },
            headers: {
                'X-CMC_PRO_API_KEY': 'f78fa793-b95e-4a58-a0ef-760f070defb0'
            },
            json: true,
            gzip: true
        };
        try {
            let wallet = await createQueryBuilder(SkiperWallet)
                .innerJoinAndSelect("SkiperWallet.currencyID", "currencyID")
                .innerJoinAndSelect("SkiperWallet.userID", "userID")
                .where("currencyID.iso = :iso", { iso: crypto })
                .andWhere("userID.id = :id", { id: id }).getOne();
            if (crypto == "ALY") {
                if (wallet != undefined) {
                    let cryptodate = {
                        currency: wallet.currencyID.name,
                        amount: wallet.amount_crypto,
                        price_usd: parseFloat((wallet.amount_crypto * 1).toString()).toFixed(2),
                        price_crypto: 1

                    }
                    return cryptodate;
                }
                let cryptodate = {
                    currency: crypto,
                    amount: null,
                    price_usd: 0,
                    price_crypto: 1
                }
                return cryptodate;
            }
            return rp(requestOptions).then(async response => {
                if (wallet != undefined) {
                    let cryptodate = {
                        currency: wallet.currencyID.name,
                        amount: wallet.amount_crypto,
                        price_usd: parseFloat((wallet.amount_crypto * response.data[`${crypto}`].quote.USD.price).toString()).toFixed(2),
                        price_crypto: parseFloat(response.data[`${crypto}`].quote.USD.price).toFixed(2),
                        change24h: (response.data[`${crypto}`].quote.USD.percent_change_24h)
                    }
                    return cryptodate;
                }
                let cryptodate = {
                    currency: crypto,
                    amount: null,
                    price_usd: 0,
                    price_crypto: parseFloat(response.data[`${crypto}`].quote.USD.price).toFixed(2),
                    change24h: (response.data[`${crypto}`].quote.USD.percent_change_24h)
                }
                return cryptodate;
            }).catch((err) => {
                console.log('API call error:', err.message);
            });
        } catch (error) {
            console.log(error)
        }
    }

    async GetUserWallets(id: number) {
        let result: any = await createQueryBuilder("User")
            .innerJoinAndSelect("User.skiperWallet", "SkiperWallet")
            .innerJoinAndSelect("SkiperWallet.currencyID", "Currency")
            .innerJoinAndSelect("SkiperWallet.countryID", "Countrie")
            .where("User.id = :iduser", { iduser: id })
            .andWhere("Currency.isCrypto = 0")
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

    async updateUserSponsor(idUser: number, idSponsor: number) {

        let user = await this.getUserById(idUser)
        user.sponsor_id = idSponsor

        return this.userRepository.save(user)
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