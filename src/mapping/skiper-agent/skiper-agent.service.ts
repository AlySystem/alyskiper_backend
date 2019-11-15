import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SkiperAgent } from './skiper-agent.entity';
import { Repository, createQueryBuilder } from 'typeorm';
import { AgentInput, AgentDriveInput } from './skiper-agent.dto';
import { UserService } from '../users/user.service';
import { CategoryAgentService } from '../category-agent/category-agent.service';
import { User } from '../users/user.entity';
import { SkiperTravelsService } from '../skiper-travels/skiper-travels.service';
require('isomorphic-fetch');

@Injectable()
export class SkiperAgentService {

    constructor(
        @InjectRepository(SkiperAgent) private agentRepository: Repository<SkiperAgent>,
        private readonly userService: UserService,
        private readonly categoryAgentService: CategoryAgentService,
        private readonly skiperTravelsService: SkiperTravelsService,
    ) { }

    async getAll() {
        return await this.agentRepository.find({ relations: ["user", "categoryAgent"] });
    }

    async getById(id: number) {
        return await this.agentRepository.findOne({
            relations: ["user", "categoryAgent"],
            where: { id: id }
        });
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
                key: "AIzaSyDRc0P0ozp5BU98gDG06OXbFaGk3OiOYxw",
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
                        console.log(json.status)
                        const errorMessage = json.error_message || 'Unknown error';
                        throw new HttpException(
                            errorMessage,
                            HttpStatus.BAD_REQUEST
                        );
                    }
                    return json;
                });
            return x
        }
        return await ReturnDist()
    };

    async ObtenerDriveMasCercano(
        lat: number, lng: number,
        Drives: AgentDriveInput[]): Promise<number> {

        //primero vamos a sacar solos los drive que no se encuentren en ningun viaje
        let DriverDisponibles = [];

        var x = await Promise.all(
            Drives.map(async item => {
                var x = await this.skiperTravelsService.getTravelByAgentId(item.iddrive)
                if (x == undefined)
                    DriverDisponibles.push(item)
            })
        )

        if (DriverDisponibles.length == 0)
            throw new HttpException(
                "No hay Drivers disponibles",
                HttpStatus.BAD_REQUEST
            );

        var t = await Promise.all(DriverDisponibles.map(async item => {
            var Distancia = await this.GetDistance(
                lat.toString() + ',' + lng.toString(),
                item.lat.toString() + ',' + item.lng.toString())
            item.distancia = Distancia.routes[0].legs[0].distance.value
        }))

        var drive = DriverDisponibles.sort(function (element1, element2) { return element1.distancia - element2.distancia })[0]
        return drive.iddrive
    }

    async getByUser(user: User) {
        try {
            return await this.agentRepository.findOne({
                where: { user: user }
            });
        } catch (error) {
            console.log(error)
        }
    }


    async register(agent: AgentInput) {
        try {
            let user = await this.userService.getUserById(agent.user_id);
            let category = await this.categoryAgentService.getById(agent.categoryAgent_id);
            if (user !== undefined && category !== undefined) {
                let agentInsert: SkiperAgent = SkiperAgentService.parseAgent(agent, user, category);
                return await this.agentRepository.save(agentInsert);
            }
            return null;
        } catch (error) {
            console.log(error)
            return null;
        }
    }

    async update(agent: AgentInput) {
        try {
            let agentUpdate = await this.getById(agent.id);
            if (agentUpdate !== undefined) {
                agentUpdate.state = agent.state;
                return await this.agentRepository.save(agentUpdate);
            }

        } catch (error) {
            console.log(error)
        }
    }
    /*
        SELECT ref., c., ci.* FROM users u
        INNER JOIN users ref ON u.id = ref.sponsor_id
        INNER JOIN countries c ON ref.idcountry = c.id
        INNER JOIN cities ci ON ref.idcity = ci.id
        WHERE u.id = 1
    */
    async searchAgentsByUserId(iduser: number) {
        try {
            let result = await createQueryBuilder("User")
                .innerJoinAndSelect("User.country", "Country")
                .innerJoinAndSelect("User.city", "City")
                .innerJoinAndSelect("User.skiperAgent","SkiperAgent")
                // .innerJoinAndSelect("SkiperAgent.user", "UserAgent")
                .innerJoinAndSelect("SkiperAgent.categoryAgent", "CategoryAgent")
                .where("User.sponsor_id = :iduser", { iduser })
                .getMany();
            return result;
        } catch (error) {
            console.log(error)
        }
    }

    public static parseAgent(input: AgentInput, user?, category?): SkiperAgent {
        let agent: SkiperAgent = new SkiperAgent();
        agent.identity = input.identity;
        agent.state = input.state;
        agent.create_at = input.create_at;
        agent.user = user;
        agent.categoryAgent = category;
        return agent;
    }
}