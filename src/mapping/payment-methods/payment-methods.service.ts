import { Injectable } from '@nestjs/common';
import { PaymentMethods } from './payment-methods.entity';
import { Repository, createQueryBuilder } from 'typeorm';
import { PaymentMethodInput, AlypayPaymentDto, CashPaymentDto, PaymentMethodDto, PaymentMethodsDto } from './payment-methods.dto';
import { InjectRepository } from '@nestjs/typeorm';
import node_geocoder from 'node-geocoder';
import { CountrieService } from '../countries/countrie.service';
import { CurrencyDto, CurrencyWhitWalletDto } from '../currency/currency.dto';
import { SkiperWalletDto, Bitcoin, Ethereum, LiteCoin, Dash, Alycoin } from '../skiper-wallet/skiper-wallet.dto';
import { UserService } from '../users/user.service';
import geotz from 'geo-tz';
import momentTimeZone from 'moment-timezone';
import { SkiperWalletService } from '../skiper-wallet/skiper-wallet.service';


@Injectable()
export class PaymentMethodsService {
    constructor(
        @InjectRepository(PaymentMethods)
        private readonly respository: Repository<PaymentMethods>,
        private readonly countryservice: CountrieService,
        private readonly userservice: UserService,
        private readonly walletservice: SkiperWalletService
    ) { }

    async getAll(): Promise<PaymentMethods[]> {
        return await this.respository.find();
    }

    async getActive(total: number, userId: number, lat: number, long: number) {
        try {
            var options = {
                provider: 'google',
                httpAdapter: 'https', // Default
                apiKey: 'AIzaSyDJqxifvNO50af0t6Y9gaPCJ8hYtkbOmQ8', // for Mapquest, OpenCage, Google Premier
                formatter: 'json' // 'gpx', 'string', ...
            };
            let geocoder = node_geocoder(options);
            let datecountry = await geocoder.reverse({ lat: lat, lon: long })

            let country = this.countryservice.getCountrieByName(datecountry[0].country)
            let cash = createQueryBuilder(PaymentMethods, "PaymentMethods")
                .innerJoinAndSelect("PaymentMethods.currency", "currency")
                .where("currency.isCrypto=0")
                .andWhere("currency.idcountry= :idcountry", { idcountry: (await country).id }).getOne();

            let crypto = createQueryBuilder(PaymentMethods, "PaymentMethods")
                .innerJoinAndSelect("PaymentMethods.currency", "currency")
                .where("currency.isCrypto=1").getOne();

            let bitcoin = this.userservice.getAmountByNameCurrency("BTC", userId);
            let ethereum = this.userservice.getAmountByNameCurrency("ETH", userId);
            let litecoin = this.userservice.getAmountByNameCurrency("LTC", userId);
            let dash = this.userservice.getAmountByNameCurrency("DASH", userId);
            let alycoin = this.userservice.getAmountByNameCurrency("ALY", userId);


            let zonahoraria = geotz(lat, long)
            let date = momentTimeZone().tz(zonahoraria.toString()).format("YYYY-MM-DD")
            let exchange = this.walletservice.getExchange((await country).nicename, date);

            return Promise.all([cash, crypto, bitcoin, ethereum, litecoin, dash, alycoin, exchange]).then(result => {

                let currencyDto = new CurrencyDto();
                currencyDto.id = result[0].currency[0].id;
                currencyDto.name = result[0].currency[0].name;
                currencyDto.url_img = result[0].currency[0].url_img;

                let cashpaymentDto = new CashPaymentDto();
                cashpaymentDto.id = result[0].id;
                cashpaymentDto.name = result[0].name;
                cashpaymentDto.pay_commissions = result[0].pay_commissions;
                cashpaymentDto.active = result[0].active;
                cashpaymentDto.urlImg = result[0].urlImg;
                cashpaymentDto.currency = currencyDto;


                let bitcoin = new Bitcoin();
                bitcoin.id = result[1].currency[0].id;
                bitcoin.name = result[1].currency[0].name;
                bitcoin.url_img = result[1].currency[0].url_img;
                let btc_amount: any = parseFloat(result[2].amount).toFixed(8);
                bitcoin.amount_crypto = btc_amount;
                bitcoin.price_usd = result[2].price_usd;
                let btc_local = bitcoin.price_usd * result[7].value
                bitcoin.price_local = parseFloat(btc_local.toFixed(2));
                bitcoin.price_crypto = result[2].price_crypto;
                let usdb = total / result[7].value;
                let incryptob = parseFloat(usdb.toFixed(2)) / bitcoin.price_crypto;
                bitcoin.priceTravel = parseFloat(incryptob.toFixed(8));
                bitcoin.change24h = result[2].change24h;
                console.log(bitcoin)
                let ethereum = new Ethereum();
                ethereum.id = result[1].currency[1].id;
                ethereum.name = result[1].currency[1].name;
                ethereum.url_img = result[1].currency[1].url_img;
                ethereum.amount_crypto = result[3].amount;
                ethereum.price_usd = result[3].price_usd;
                let eth_local = ethereum.price_usd * result[7].value
                ethereum.price_local = parseFloat(eth_local.toFixed(2));
                ethereum.price_crypto = result[3].price_crypto;
                let usde = total / result[7].value;
                let incryptoe = parseFloat(usde.toFixed(2)) / ethereum.price_crypto;
                ethereum.priceTravel = parseFloat(incryptoe.toFixed(8));
                ethereum.change24h = result[3].change24h;

                let litecoin = new LiteCoin();
                litecoin.id = result[1].currency[2].id;
                litecoin.name = result[1].currency[2].name;
                litecoin.url_img = result[1].currency[2].url_img;
                litecoin.amount_crypto = result[4].amount;
                litecoin.price_usd = result[4].price_usd;
                let lite_local = litecoin.price_usd * result[7].value
                litecoin.price_local = parseFloat(lite_local.toFixed(2));
                litecoin.price_crypto = result[4].price_crypto;
                let usdl = total / result[7].value;
                let incryptol = parseFloat(usdl.toFixed(2)) / litecoin.price_crypto;
                litecoin.priceTravel = parseFloat(incryptol.toFixed(8));
                litecoin.change24h = result[4].change24h;

                let dash = new Dash();
                dash.id = result[1].currency[3].id;
                dash.name = result[1].currency[3].name;
                dash.url_img = result[1].currency[3].url_img;
                dash.amount_crypto = result[5].amount;
                dash.price_usd = result[5].price_usd;
                let dash_local = dash.price_usd * result[7].value
                dash.price_local = parseFloat(dash_local.toFixed(2));
                dash.price_crypto = result[5].price_crypto;
                let usdd = total / result[7].value;
                let incryptod = parseFloat(usdd.toFixed(2)) / dash.price_crypto;
                dash.priceTravel = parseFloat(incryptod.toFixed(8));
                dash.change24h = result[5].change24h;


                let alycoin = new Alycoin();
                alycoin.id = result[1].currency[4].id;
                alycoin.name = result[1].currency[4].name;
                alycoin.url_img = result[1].currency[4].url_img;
                alycoin.amount_crypto = result[6].amount;
                alycoin.price_usd = result[6].price_usd;
                let aly_local = alycoin.price_usd * result[7].value
                alycoin.price_local = parseFloat(aly_local.toFixed(2));
                alycoin.price_crypto = result[6].price_crypto;
                let usda = total / result[7].value;
                let incryptoa = parseFloat(usda.toFixed(2)) / alycoin.price_crypto;
                alycoin.priceTravel = parseFloat(incryptoa.toFixed(8));

                let alypayPaymentDto = new AlypayPaymentDto();
                alypayPaymentDto.id = result[1].id
                alypayPaymentDto.name = result[1].name;
                alypayPaymentDto.pay_commissions = result[1].pay_commissions;
                alypayPaymentDto.active = result[1].active;
                alypayPaymentDto.urlImg = result[1].urlImg;
                alypayPaymentDto.bitcoin = bitcoin;
                alypayPaymentDto.ethereum = ethereum;
                alypayPaymentDto.litecoin = litecoin;
                alypayPaymentDto.dash = dash;
                alypayPaymentDto.alycoin = alycoin;

                let paymentMethodsDto = new PaymentMethodsDto()
                paymentMethodsDto.cash = cashpaymentDto;
                paymentMethodsDto.alypay = alypayPaymentDto;

                return paymentMethodsDto;
            });
        } catch (error) {
            console.log(error)
        }

    }

    async getById(id: number): Promise<PaymentMethods> {
        return await this.respository.findOneOrFail({ where: { id } });
    }

    async registerPaymentMethod(input: PaymentMethodInput) {
        try {
            let respt = this.parsePaymentMethods(input);
            return await this.respository.save(respt);
        } catch (error) {
            console.error(error);
        }
    }

    async updatePaymentMethod(input: PaymentMethodInput) {
        try {
            let respt = await this.getById(input.id);
            if (respt) {
                respt.name = input.name;
                respt.pay_commissions = input.pay_commissions;
                return await this.respository.save(respt);
            }

        } catch (error) {
            console.error(error);
        }
    }

    private parsePaymentMethods(input: PaymentMethodInput): PaymentMethods {
        let paymentmethods: PaymentMethods = new PaymentMethods();
        paymentmethods.name = input.name;
        paymentmethods.pay_commissions = input.pay_commissions;
        return paymentmethods;
    }
}
