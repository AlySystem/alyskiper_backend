import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SkiperCatProductInput } from './skiper-cat-product-commerce.dto';
import { Repository } from 'typeorm';
import { SkiperCommerceService } from '../skiper-commerce/skiper-commerce.service';
import { SkiperCatProductsCommerce } from './skiper-cat-products-commerce.entity';

@Injectable()
export class SkiperCatProductCommerceService {

    constructor(
        @InjectRepository(SkiperCatProductsCommerce) private readonly repository:Repository<SkiperCatProductsCommerce>,
        private readonly skiperCommerceService:SkiperCommerceService
    ){}

    async getAll():Promise<SkiperCatProductsCommerce[]> {
        return await this.repository.find({relations:["skiperCommerce"]});
    }

    async getById(id:number) :Promise<SkiperCatProductsCommerce>{
        try {
            let result = await this.repository.findOne({
                relations:["skiperCommerce"],
                where:{id}
            });
            console.log(result)
            return result;
        } catch (error) {
            console.error(error)
        }
    }

    async getWithPagination(page: number = 1): Promise<SkiperCatProductsCommerce[]>{
        const result = await this.repository.find({
            relations:["skiperCommerce"],
            take: 25,
            skip: 25 * (page - 1),
            order: { id: 'ASC' }
        });
        return result;
    }

    async create(input: SkiperCatProductInput): Promise<SkiperCatProductsCommerce>{
        try {
            let commerce = await this.skiperCommerceService.getById(input.skiperCommerceID);
            if(commerce !== undefined){ // verificar si el comercio existe
                let catProducts = this.parseCatProducts(input,commerce);
                return this.repository.save(catProducts);
            }
        } catch (error) {
            console.log(error)
        }
    }

    private parseCatProducts(input:SkiperCatProductInput,commerce?): SkiperCatProductsCommerce{
        let cat: SkiperCatProductsCommerce = new SkiperCatProductsCommerce();
        cat.name = input.name;
        cat.description = input.description;
        cat.url_img_product = input.url_img_product || "";
        cat.skiperCommerce = commerce;
        return cat;
    }
}