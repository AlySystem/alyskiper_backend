import { Injectable, Logger, HttpException, HttpStatus, forwardRef, Inject } from '@nestjs/common';
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

@Injectable()
export class UserService {

    private logger = new Logger('UserService');

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @Inject(forwardRef(() => SkiperWalletService))
        private readonly skiperwalletservice: SkiperWalletService,
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

        let all = createQueryBuilder(User)
            .innerJoinAndSelect("User.skiperWallet", "SkiperWallet")
            .innerJoinAndSelect("SkiperWallet.currencyID", "Currency")
            .innerJoinAndSelect("SkiperWallet.countryID", "Countrie")
            .where("User.id = :iduser", { iduser: id })
            .andWhere("Currency.isCrypto = 1")
            .getOne();

        let currencieswhitwallet = createQueryBuilder(Currency, "Currency")
            .leftJoinAndSelect("Currency.skiperwallet", "skiperwallet")
            .leftJoinAndSelect("skiperwallet.userID", "userID")
            .where("userID.id = :id", { id: id })
            .andWhere("Currency.isCrypto = 1").getOne();
        let currencies = createQueryBuilder(Currency, "Currency")
            .andWhere("Currency.isCrypto = 1").getMany();



        const url = `https://api.coinmarketcap.com/v1/ticker/${(await all).skiperWallet[0].currencyID.name}/`;
        var cryptodate = fetch(url)
            .then(response => response.json())
            .then(json => {
                return json;
            });
        let country = this.country.getById((await all).idcountry);
        let zonahoraria = geotz(lat, long)
        let date = momentTimeZone().tz(zonahoraria.toString()).format("YYYY-MM-DD")

        let exchange = this.skiperwalletservice.getExchange((await country).nicename, date);

        return await Promise.all([all, exchange, cryptodate, currencies, currencieswhitwallet]).then(async result => {


            let bitcoin = new Bitcoin();
            bitcoin.id = result[3][0].id;
            bitcoin.name = result[3][0].name;
            bitcoin.url_img = result[3][0].url_img;
            let amount_btc = await this.getAmountByNameCurrency(bitcoin.name, id);
            bitcoin.amount_crypto = (amount_btc.amount_crypto != undefined) ? amount_btc.amount_crypto : null;
            let btc_price_usd = await this.getAmountByBTC(bitcoin.name, bitcoin.amount_crypto);
            bitcoin.price_usd = parseFloat(btc_price_usd.toString());
            let btc_local = bitcoin.price_usd * result[1].value
            bitcoin.price_local = parseFloat(btc_local.toFixed(2));
            let btc_price_crypto = await this.getPriceCrypto(bitcoin.name);
            bitcoin.price_crypto = parseFloat(btc_price_crypto);

            let ethereum = new Ethereum();
            ethereum.id = result[3][1].id;
            ethereum.name = result[3][1].name;
            ethereum.url_img = result[3][1].url_img;
            let amount_eth = await this.getAmountByNameCurrency(ethereum.name, id);
            ethereum.amount_crypto = (amount_eth.amount_crypto != undefined) ? amount_eth.amount_crypto : null;
            let eth_price_usd = await this.getAmountByBTC(ethereum.name, ethereum.amount_crypto);
            ethereum.price_usd = parseFloat(eth_price_usd.toString());
            let eth_local = ethereum.price_usd * result[1].value
            ethereum.price_local = parseFloat(eth_local.toFixed(2));
            let eth_price_crypto = await this.getPriceCrypto(ethereum.name);
            ethereum.price_crypto = parseFloat(eth_price_crypto);

            let litecoin = new LiteCoin();
            litecoin.id = result[3][2].id;
            litecoin.name = result[3][2].name;
            litecoin.url_img = result[3][2].url_img;
            let amount_litecoin = await this.getAmountByNameCurrency(litecoin.name, id);
            litecoin.amount_crypto = (amount_litecoin != undefined) ? amount_litecoin.amount_crypto : null;
            let lite_price_usd = await this.getAmountByBTC(litecoin.name, litecoin.amount_crypto);
            litecoin.price_usd = parseFloat(lite_price_usd.toString());
            let lite_local = litecoin.price_usd * result[1].value
            litecoin.price_local = parseFloat(lite_local.toFixed(2));
            let lite_price_crypto = await this.getPriceCrypto(litecoin.name);
            litecoin.price_crypto = parseFloat(lite_price_crypto);

            let dash = new Dash();
            dash.id = result[3][3].id;
            dash.name = result[3][3].name;
            dash.url_img = result[3][3].url_img;
            let amount_dash = await this.getAmountByNameCurrency(dash.name, id);
            dash.amount_crypto = (amount_dash != undefined) ? amount_dash.amount_crypto : null;
            let dash_price_usd = await this.getAmountByBTC(dash.name, dash.amount_crypto);
            dash.price_usd = parseFloat(dash_price_usd.toString());
            let dash_local = dash.price_usd * result[1].value
            dash.price_local = parseFloat(dash_local.toFixed(2));
            let dash_price_crypto = await this.getPriceCrypto(dash.name);
            dash.price_crypto = parseFloat(dash_price_crypto);


            let alycoin = new Alycoin();
            alycoin.id = result[3][4].id;
            alycoin.name = result[3][4].name;
            bitcoin.url_img = result[3][4].url_img;
            let amount_alycoin = await this.getAmountByNameCurrency(alycoin.name, id);
            alycoin.amount_crypto = (amount_alycoin != undefined) ? amount_alycoin.amount_crypto : null;
            let aly_price_usd = await this.getAmountByBTC(alycoin.name, alycoin.amount_crypto);
            alycoin.price_usd = parseFloat(aly_price_usd.toString());
            let aly_local = alycoin.price_usd * result[1].value
            alycoin.price_local = parseFloat(aly_local.toFixed(2));
            alycoin.price_crypto = 1;

            let cryptosDto = new CryptosDto();
            cryptosDto.bitcoin = bitcoin;
            cryptosDto.alycoin = alycoin;
            cryptosDto.dash = dash;
            cryptosDto.ethereum = ethereum;
            cryptosDto.litecoin = litecoin;

            return cryptosDto;
        })

    }
    async getPriceCrypto(crypto: string) {
        try {
            let url = `https://api.coinmarketcap.com/v1/ticker/${crypto}/`;
            let cryptodate = await fetch(url)
                .then(response => response.json())
                .then(json => {
                    return json;
                });
            let price_return = parseFloat(cryptodate[0].price_usd);
            return price_return.toFixed(2);
        } catch (error) {
            console.log(error)
        }
    }
    async getAmountByBTC(crypto: string, amountCrypto: number) {
        try {
            if (amountCrypto != null) {
                if (crypto != "Alycoin") {
                    let url = `https://api.coinmarketcap.com/v1/ticker/${crypto}/`;
                    let cryptodate = await fetch(url)
                        .then(response => response.json())
                        .then(json => {
                            return json;
                        });
                    let result = parseFloat(amountCrypto.toString()) * parseFloat(cryptodate[0].price_usd);
                    return result.toFixed(2);
                } else {
                    let result = parseFloat(amountCrypto.toString()) * 1;
                    return result;
                }
            } else {
                return 0;
            }
        } catch (error) {
            console.log(error)
        }
    }


    async getAmountByNameCurrency(crypto: string, id: number) {
        return await createQueryBuilder(SkiperWallet)
            .innerJoinAndSelect("SkiperWallet.currencyID", "currencyID")
            .innerJoinAndSelect("SkiperWallet.userID", "userID")
            .where("currencyID.name = :name", { name: crypto })
            .andWhere("userID.id = :id", { id: id }).getOne();
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