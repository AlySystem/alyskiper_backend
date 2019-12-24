import { ObjectType, Field, InputType } from "type-graphql";
import { UserDto } from "../users/user.dto";
import { categoryDto } from "../category-agent/category-agent.dto";
import { SkiperVehicleAgent } from "../skiper-vehicle-agent/skiper-vehicle-agent.entity";

@ObjectType()
export class SkiperAgentDto {
    id: number;
    iduser: number;
    state: boolean;
    identity: string;
    create_at: Date;
    categoryAgent: categoryDto;
    user: UserDto;
    skiperVehicleAgent: SkiperVehicleAgent;
}

@InputType()
export class UserInput {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    user: string;
    password: string;
    sponsor_id: number;
    address: string;
    phone: string;
    create_at: Date;
    date_birth: Date;
    is_online: boolean;
    avatar: string;
    country_id: number;
    city_id: number;
    idcivil_status: number;
}

@InputType()
export class AgentInput {
    id: number;
    iduser: number;
    state: boolean;
    identity: string;
    create_at: Date;
    categoryAgent_id: number;
    user_id: number;
}

@InputType()
export class AgentDriveInput {
    iddrive: number;
    lat: number;
    lng: number;
    distancia: number;
}