import { InputType, ObjectType } from "type-graphql";
import { SkiperAgentDto } from '../skiper-agent/skiper-agent.dto';
import { CurrencyDto } from '../currency/currency.dto';



@InputType()
export class ExecutiveCommissionsInput {
    id: number;
    agentID: number;
    idreference: number;
    amountcomission: number;
    idcurrency: number;
    state: boolean;
    date_in: Date;
}

@ObjectType()
export class ExecutiveCommissionsDTO {
    id: number;
    idreference: number;
    amountcomission: number;
    idcurrency: number;
    state: boolean;
    date_in: Date;
    agent: SkiperAgentDto;
    currency: CurrencyDto;
}