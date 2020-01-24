import { Injectable } from '@nestjs/common';
import { PaymentMethods } from './payment-methods.entity';
import { Repository, createQueryBuilder } from 'typeorm';
import { PaymentMethodInput, AlypayPaymentDto, CashPaymentDto } from './payment-methods.dto';
import { InjectRepository } from '@nestjs/typeorm';
import node_geocoder from 'node-geocoder';
import { CountrieService } from '../countries/countrie.service';


@Injectable()
export class PaymentMethodsService {
    constructor(
        @InjectRepository(PaymentMethods)
        private readonly respository: Repository<PaymentMethods>,
        private readonly countryservice: CountrieService
    ) { }

    async getAll(): Promise<PaymentMethods[]> {
        return await this.respository.find();
    }

    async getActive(lat: number, long: number) {
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

        return Promise.all([cash, crypto]).then(result => {
            return result;
        });

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
