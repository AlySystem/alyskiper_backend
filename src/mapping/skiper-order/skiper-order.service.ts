import { Injectable, HttpException, HttpStatus, forwardRef, Inject } from '@nestjs/common';
import { SkiperOrder } from './skiper-order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection, getManager } from 'typeorm';
import { UserService } from '../users/user.service';
import { SkiperCommerceService } from '../skiper-commerce/skiper-commerce.service';
import { SkiperOrderInput } from './skiper-order.dto';
import { SkiperOrderTracing } from '../skiper-order-tracing/skiper-order-tracing.entity';
import { SkiperOrderDetailInput } from '../skiper-order-detail/skiper-order-detail.dto';
import { SkiperOrderDetailService } from '../skiper-order-detail/skiper-order-detail.service';
import { SkiperOrderTracingService } from '../skiper-order-tracing/skiper-order-tracing.service';

@Injectable()
export class SkiperOrderService {

    constructor(
        @InjectRepository(SkiperOrder) private readonly repository: Repository<SkiperOrder>,
        private readonly userService: UserService,
        private readonly skiperCommerceService: SkiperCommerceService,
        private readonly skiperOrderDetailService: SkiperOrderDetailService,
        private readonly skiperOrderTracingService: SkiperOrderTracingService,
    ) { }

    async getAll(): Promise<SkiperOrder[]> {
        return await this.repository.find({ relations: ["user", "skiperCommerce", "skiperOrderTracing"] });
    }

    async GetOrdenes(idcommerce: number, status: number[]): Promise<SkiperOrder[]> {
        return await this.repository.createQueryBuilder("SkiperOrder")
            .innerJoinAndSelect("SkiperOrder.user", "User")
            .innerJoinAndSelect("SkiperOrder.skiperCommerce", "SkiperCommerce", "SkiperCommerce.id = :idcommerce", { idcommerce })
            .innerJoinAndSelect("SkiperOrder.skiperOrderTracing", "SkiperOrderTracing", "SkiperOrderTracing.orderStatus IN (:idstatus)", { idstatus: status })
            .innerJoinAndSelect("SkiperOrder.skiperOrderDetail", "SkiperOrderDetail")
            .leftJoinAndSelect("SkiperOrderDetail.skiperProductCommerce", "SkiperProductCommerce")
            .innerJoinAndSelect(subQuery => {
                return subQuery
                    .select("skiperOrderTracing.idorder", "idorder").addSelect("MAX(skiperOrderTracing.datetracing)", "fecha")
                    .from(SkiperOrderTracing, "skiperOrderTracing")
                    .groupBy("skiperOrderTracing.idorder")
            }, "d", "SkiperOrderTracing.idorder = d.idorder and SkiperOrderTracing.datetracing = d.fecha")
            .innerJoinAndSelect("SkiperOrderTracing.orderStatus", "SkiperOrdersStatus")
            .getMany();
    }

    async GetOrderByID(idorder: number): Promise<SkiperOrder> {
        return await this.repository.createQueryBuilder("SkiperOrder")
            .innerJoinAndSelect("SkiperOrder.user", "User")
            .innerJoinAndSelect("SkiperOrder.skiperCommerce", "SkiperCommerce")
            .innerJoinAndSelect("SkiperOrder.skiperOrderTracing", "SkiperOrderTracing")
            .innerJoinAndSelect("SkiperOrder.skiperOrderDetail", "SkiperOrderDetail")
            .leftJoinAndSelect("SkiperOrderDetail.skiperProductCommerce", "SkiperProductCommerce")
            .innerJoinAndSelect(subQuery => {
                return subQuery
                    .select("skiperOrderTracing.idorder", "idorder").addSelect("MAX(skiperOrderTracing.datetracing)", "fecha")
                    .from(SkiperOrderTracing, "skiperOrderTracing")
                    .groupBy("skiperOrderTracing.idorder")
            }, "d", "SkiperOrderTracing.idorder = d.idorder and SkiperOrderTracing.datetracing = d.fecha")
            .innerJoinAndSelect("SkiperOrderTracing.orderStatus", "SkiperOrdersStatus")
            .where("SkiperOrder.id = :idorder", { idorder })
            .getOne();
    }

    async CountOrders(idcommerce: number, status: number[]): Promise<number> {
        return await this.repository.createQueryBuilder("SkiperOrder")
            .innerJoinAndSelect("SkiperOrder.user", "User")
            .innerJoinAndSelect("SkiperOrder.skiperCommerce", "SkiperCommerce", "SkiperCommerce.id = :idcommerce", { idcommerce })
            .innerJoinAndSelect("SkiperOrder.skiperOrderTracing", "SkiperOrderTracing", "SkiperOrderTracing.orderStatus IN (:idstatus)", { idstatus: status })
            .innerJoinAndSelect("SkiperOrder.skiperOrderDetail", "SkiperOrderDetail")
            .leftJoinAndSelect("SkiperOrderDetail.skiperProductCommerce", "SkiperProductCommerce")
            .innerJoinAndSelect(subQuery => {
                return subQuery
                    .select("skiperOrderTracing.idorder", "idorder").addSelect("MAX(skiperOrderTracing.datetracing)", "fecha")
                    .from(SkiperOrderTracing, "skiperOrderTracing")
                    .groupBy("skiperOrderTracing.idorder")
            }, "d", "SkiperOrderTracing.idorder = d.idorder and SkiperOrderTracing.datetracing = d.fecha")
            .innerJoinAndSelect("SkiperOrderTracing.orderStatus", "SkiperOrdersStatus")
            .getCount();
    }

    async getById(id: number): Promise<SkiperOrder> {
        return await this.repository.findOneOrFail({
            relations: ["user", "skiperCommerce"],
            where: { id: id }
        });
    }

    async update(input: SkiperOrderInput): Promise<SkiperOrder> {
        try {
            let skiperorderUpdate = await this.getById(input.id);
            skiperorderUpdate.userphone = input.userphone;
            skiperorderUpdate.useraddress = input.useraddress;
            skiperorderUpdate.orderdate = input.orderdate;
            skiperorderUpdate.totalprice = input.totalprice;
            skiperorderUpdate.numitem = input.numitem;
            skiperorderUpdate.iduser = input.userID;
            skiperorderUpdate.idcommerce = input.commerceID;
            return await this.repository.save(skiperorderUpdate);
        } catch (error) {
            console.log(error)
        }
    }

    async registerSkiperOrder(input: SkiperOrderInput): Promise<SkiperOrder> {
        try {

            let skiperorder = this.parseSkiperOder(input);
            console.log(skiperorder);
            return this.repository.save(skiperorder);
        }
        catch (error) {
            console.error(error);
        }
        return null;
    }

    async GenereSkiperOrder(inputorder: SkiperOrderInput,
        inputorderdetalle: SkiperOrderDetailInput[]): Promise<SkiperOrder> {        
        try {
            let order = new SkiperOrder();
            await getManager().transaction(async transactionalEntityManager => {
                order = this.parseSkiperOder(inputorder)
                var orderreg = await transactionalEntityManager.save(order);
                inputorderdetalle.forEach(async x => {
                    x.orderID = order.id
                    var detalleorder = this.skiperOrderDetailService.parseSkiperOrderDetail(x);
                    await transactionalEntityManager.save(detalleorder);
                })
                //registramos el seguimiento de la orden 1 es por defecto
                let ordertracing = new SkiperOrderTracing();
                ordertracing.idorder = orderreg.id;
                ordertracing.idorderstatus = 1;
                ordertracing.datetracing = new Date();
                await transactionalEntityManager.save(ordertracing);
            });
            return order;
        }
        catch (error) {
            throw new HttpException(
                error,
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    private parseSkiperOder(input: SkiperOrderInput): SkiperOrder {
        let skiperorder: SkiperOrder = new SkiperOrder();
        skiperorder.userphone = input.userphone;
        skiperorder.useraddress = input.useraddress;
        skiperorder.orderdate = input.orderdate;
        skiperorder.totalprice = input.totalprice;
        skiperorder.numitem = input.numitem;
        skiperorder.iduser = input.userID;
        skiperorder.idcommerce = input.commerceID;
        return skiperorder;
    }


}