import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { SkiperAgentService } from './skiper-agent.service';
import { SkiperAgentDto, AgentInput, AgentDriveInput } from './skiper-agent.dto';
import { AuthGuard } from '../../shared/auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver('SkiperAgent')
export class SkiperAgentResolver {

    constructor(
        private agentService: SkiperAgentService
    ) { }

    @Query()
    async agents() {
        return this.agentService.getAll();
    }

    @Query()
    searchAgentsBySponsorId(@Args('idsponsor') iduser: number) {
        return this.agentService.searchAgentsBySponsorId(iduser);
    }

    @Query()
    searchAgentByIdUser(@Args('iduser') iduser: number) {
        return this.agentService.searchAgentByIdUser(iduser);
    }

    @Mutation()
    async ObtenerDriveCercano(@Args('lat') lat: number,
        @Args('lng') lng: number,
        @Args('inputdrive') inputdrive: AgentDriveInput[]) {
        return this.agentService.ObtenerDriveMasCercano(lat, lng, inputdrive);
    }

    @Mutation()
    async registerAgent(@Args('input') input: AgentInput) {
        return this.agentService.register(input);
    }

    @UseGuards(new AuthGuard())
    @Mutation()
    async updateAgent(@Args('input') input: AgentInput) {
        return this.agentService.update(input);
    }
}
