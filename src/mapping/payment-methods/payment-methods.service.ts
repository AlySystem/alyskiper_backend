import { Injectable } from '@nestjs/common';
import { PaymentMethods } from './payment-methods.entity';
import { Repository } from 'typeorm';
import { PaymentMethodInput } from './payment-methods.dto';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class PaymentMethodsService {
    constructor(
        @InjectRepository(PaymentMethods)
        private readonly respository: Repository<PaymentMethods>
    ) { }

    async getAll(): Promise<PaymentMethods[]> {
        return await this.respository.find();
    }

    async getActive(): Promise<PaymentMethods[]> {
        return await this.respository.find({
            where: { active: true }
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
