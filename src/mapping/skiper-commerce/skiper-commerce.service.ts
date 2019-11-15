import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SkiperCommerce } from './skiper-commerce.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, createQueryBuilder, getConnection } from 'typeorm';
import { SkiperAgentService } from '../skiper-agent/skiper-agent.service';
import { CountrieService } from '../countries/countrie.service';
import { SkiperCatCommerceService } from '../skiper-cat-commerce/skiper-cat-commerce.service';
import { CommerceInput, UserWithoutCommerceDto } from './skiper-commerce.dto';
import { CitiesService } from '../cities/cities.service';
import { UserInput } from '../users/user.dto';
import { AgentInput } from '../skiper-agent/skiper-agent.dto';
import { UserService } from '../users/user.service';
require('isomorphic-fetch');

@Injectable()
export class SkiperCommerceService {

    constructor(
        @InjectRepository(SkiperCommerce) private readonly repository: Repository<SkiperCommerce>,
        private readonly userService: UserService,
        private readonly agentService: SkiperAgentService,
        private readonly countryService: CountrieService,
        private readonly skiperCatService: SkiperCatCommerceService,
        private readonly cityService: CitiesService
    ) { }

    async getAll(): Promise<SkiperCommerce[]> {
        try {
            return await this.repository.find({
                relations: [
                    "skiperAgent", "catCommerce", "country",
                    "skiperCatProductsCommerce", "skiperCatProductsCommerce.skiperProductCommerce",
                    "skiperCatProductsCommerce.skiperProductCommerce.optionAddon"
                ]
            });
        } catch (error) {
            console.error(error)
        }
    }

    async GetDistance(origin, destination) {

        const toQueryParams = (object) => {
            return Object.keys(object)
                .filter(key => !!object[key])
                .map(key => key + "=" + encodeURIComponent(object[key]))
                .join("&")
        }

        const ReturnDist = async () => {
            const options = {
                // key: "AIzaSyD_S3b75tC_Td7aq8oQLsr5-VX9FO1v2yc", api key anterior
                key: "AIzaSyDRc0P0ozp5BU98gDG06OXbFaGk3OiOYxw", // api key pagada
                mode: "Driving"
            };

            const queryParams = {
                origin: origin,
                destination: destination,
                ...options,
            };

            const url = `https://maps.googleapis.com/maps/api/directions/json?${toQueryParams(queryParams)}` + '&language=es';

            var x = await fetch(url)
                .then(response => response.json())
                .then(json => {
                    if (json.status !== 'OK') {
                        const errorMessage = json.error_message || 'Unknown error';
                        return Promise.reject(errorMessage);
                    }
                    return json;
                });
            return x
        }
        return await ReturnDist()
    };

    async commerceIntoRadio(latitud: number, longitud: number, radio: number, id_category_product: number) {
        try {
            let comercios;
            if (id_category_product == 0) {
                // console.log('no entre aqui');
                comercios = await this.repository.createQueryBuilder("SkiperCommerce")
                    .innerJoinAndSelect("SkiperCommerce.skiperAgent", "SkiperAgent")
                    .innerJoinAndSelect("SkiperCommerce.catCommerce", "SkiperCatCommerce")
                    .innerJoinAndSelect("SkiperCommerce.country", "Countrie")
                    .leftJoinAndSelect("SkiperCommerce.skiperCatProductsCommerce", "SkiperCatProductsCommerce")
                    .leftJoinAndSelect("SkiperCatProductsCommerce.skiperProductCommerce", "SkiperProductCommerce")
                    .leftJoinAndSelect("SkiperProductCommerce.optionAddon", "OptionAddon")
                    .where("SkiperCommerce.state = true and SkiperCommerce.lat <> :parametro and SkiperCommerce.lon <> :parametro", { parametro: "" })
                    .getMany();
            } else {
                // console.log('entre aqui');
                comercios = await this.repository.createQueryBuilder("SkiperCommerce")
                    .innerJoinAndSelect("SkiperCommerce.skiperAgent", "SkiperAgent")
                    .innerJoinAndSelect("SkiperCommerce.catCommerce", "SkiperCatCommerce")
                    .innerJoinAndSelect("SkiperCommerce.country", "Countrie")
                    .leftJoinAndSelect("SkiperCommerce.skiperCatProductsCommerce", "SkiperCatProductsCommerce")
                    .leftJoinAndSelect("SkiperCatProductsCommerce.skiperProductCommerce", "SkiperProductCommerce")
                    .leftJoinAndSelect("SkiperProductCommerce.optionAddon", "OptionAddon")
                    .where("SkiperCommerce.state = true and SkiperCommerce.lat <> :parametro and SkiperCommerce.lon <> :parametro", { parametro: "" })
                    .andWhere("SkiperCatProductsCommerce.id = :idcatproduct", { idcatproduct: id_category_product })
                    .getMany();
            }
            var Comercios = []

            var c = await Promise.all(comercios.map(async x => {
                var Distancia = await this.GetDistance(latitud.toString() + "," + longitud.toString(),
                    x.lat.toString() + "," + x.lon.toString())
                if (Distancia.routes[0].legs[0].distance.value <= radio)
                    Comercios.push(x)
            }))
            return Comercios

        } catch (error) {
            throw new HttpException(
                error.message,
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async getById(id: number): Promise<SkiperCommerce> {
        return await this.repository.findOne({
            relations: ["skiperAgent", "skiperAgent.user",
                "skiperAgent.categoryAgent", "catCommerce", "country", "city",
                "skiperCatProductsCommerce", "skiperCatProductsCommerce.skiperProductCommerce"
            ],
            where: { id: id }
        });
    }

    async registerCommerce(input: CommerceInput): Promise<SkiperCommerce> {
        try {
            let agent = await this.agentService.getById(input.skiperAgentID);
            let country = await this.countryService.getById(input.countryID);
            let catCommerce = await this.skiperCatService.getById(input.catCommerceID);
            let city = await this.cityService.getById(input.cityID);
            if (agent !== undefined && country !== undefined && catCommerce !== undefined && city !== undefined) {
                let commerce = this.parseCommerce(input, agent, country, catCommerce);
                commerce.city = city;
                return this.repository.save(commerce);
            }
        } catch (error) {
            console.error(error)
        }
        return null;
    }

    async getUserWithoutCommerce() {
        let response = [];
        try {
            let result: any[] = await createQueryBuilder("User").select(["User.firstname", "User.lastname", "SkiperAgent.id"])
                .innerJoin("User.skiperAgent", "SkiperAgent")
                .leftJoin("SkiperAgent.skiperCommerce", "SkiperCommerce")
                .where("SkiperAgent.categoryAgent = 3")
                .andWhere("SkiperCommerce.id IS NULL")
                .getMany();
            if (result.length > 0) {
                result.forEach(item => {
                    response.push(new UserWithoutCommerceDto(item.firstname, item.lastname, item.skiperAgent[0]));
                });
                return response;
            }
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    /*
        select u.id,sc.namecommerce from users u
        inner join skiper_agent sa on sa.iduser = u.id
        inner join skiper_commerces sc on sc.idagent = sa.id
        inner join skiper_cat_commerces scc on scc.id = sc.id_cat_commerce
        where scc.id = 1;
    */
    async getCommercesBySponsorId(id_user: number, id_category_commerce: number = 0) {
        let result;
        if (id_category_commerce != 0) {
            result = await createQueryBuilder("SkiperCommerce")
                .innerJoinAndSelect("SkiperCommerce.catCommerce", "SkiperCatCommerce")
                .innerJoinAndSelect("SkiperCommerce.country", "Countrie")
                .innerJoinAndSelect("SkiperCommerce.city", "Cities")
                .innerJoinAndSelect("SkiperCommerce.skiperAgent", "SkiperAgent")
                .innerJoin("SkiperAgent.user", "User")
                .where("User.sponsor_id = :id_user", { id_user })
                .getMany();
        } else {
            result = await createQueryBuilder("SkiperCommerce")
                .innerJoinAndSelect("SkiperCommerce.catCommerce", "SkiperCatCommerce")
                .innerJoinAndSelect("SkiperCommerce.country", "Countrie")
                .innerJoinAndSelect("SkiperCommerce.city", "Cities")
                .innerJoinAndSelect("SkiperCommerce.skiperAgent", "SkiperAgent")
                .innerJoin("SkiperAgent.user", "User")
                .where("User.sponsor_id = :id_user", { id_user })
                .andWhere("SkiperCatCommerce.id", { id_category_commerce })
                .getMany();
        }
        return result;
    }

    async createCommerceTransaction(user: UserInput, agent: AgentInput, commerce: CommerceInput) {

        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();

        let result = null;
        let value: boolean = false;
        await queryRunner.startTransaction();
        try {
            let userCreate = await this.userService.create(user);
            if (!userCreate) {
                await queryRunner.rollbackTransaction();
                return false;
            }
            agent.user_id = userCreate.id;
            let agentCreate = await this.agentService.register(agent);
            if (!agentCreate) {
                await queryRunner.rollbackTransaction();
                return false;
            }
            commerce.skiperAgentID = agentCreate.id;
            result = await queryRunner.manager.save(commerce);
            if (result) {
                value = true;
            }
            await queryRunner.commitTransaction();
            return value;
        } catch (error) {
            console.log(error);
            await queryRunner.rollbackTransaction();
            value = false;
        } finally {
            return value;
        }
    }

    private parseCommerce(input: CommerceInput, agent?, country?, catCommerce?): SkiperCommerce {
        let commerce: SkiperCommerce = new SkiperCommerce;
        commerce.namecommerce = input.namecommerce;
        commerce.identification_ruc = input.identification_ruc;
        commerce.phone = input.phone;
        commerce.address = input.address;
        commerce.manager = input.manager;
        commerce.state = input.state;
        commerce.lat = input.lat;
        commerce.lon = input.lon;
        commerce.url_art = input.url_art;
        commerce.url_logo = input.url_logo;
        commerce.skiperAgent = agent;
        commerce.country = country;
        commerce.catCommerce = catCommerce;
        return commerce;
    }
}
