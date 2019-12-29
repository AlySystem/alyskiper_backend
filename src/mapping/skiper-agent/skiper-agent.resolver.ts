import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { SkiperAgentService } from './skiper-agent.service';
import { SkiperAgentDto, AgentInput, AgentDriveInput } from './skiper-agent.dto';
import { AuthGuard } from '../../shared/auth.guard';
import { UseGuards } from '@nestjs/common';
import { SkiperAgent } from './skiper-agent.entity';

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
    async RegisterCompleteDataAgent(
        @Args('firtsname') firtsname: string,
        @Args('lastname') lastname: string,
        @Args('email') email: string,
        @Args('username') username: string,
        @Args('password') password: string,
        @Args('address') address: string,
        @Args('phone') phone: string,
        @Args('idcountry') idcountry: number,
        @Args('idcity') idcity: number,
        @Args('identity') identity: string,
        @Args('license_plate') license_plate: string,
        @Args('idcattravel') idcattravel: number,
        @Args('id_vehicle_catalog') id_vehicle_catalog: number,
        @Args('idtrademark') idtrademark: number,
        @Args('idmodel') idmodel: number,
        @Args('idyear') idyear: number,
        @Args('url_img_identity') url_img_identity: string,
        @Args('url_img_verify_identity') url_img_verify_identity: string,
        @Args('url_img_letterone_recomendation') url_img_letterone_recomendation: string,
        @Args('url_img_lettertwo_recomendation') url_img_lettertwo_recomendation: string,
        @Args('url_img_driver_license') url_img_driver_license: string,
        @Args('url_img_police_record') url_img_police_record: string,
        @Args('url_img_driving_record') url_img_driving_record: string,
        @Args('url_img__vehicle_front') url_img__vehicle_front: string,
        @Args('url_img__vehicle_behind') url_img__vehicle_behind: string,
        @Args('url_img__vehicle_side_right') url_img__vehicle_side_right: string,
        @Args('url_img__vehicle_side_left') url_img__vehicle_side_left: string,
        @Args('url_img__vehicle_inside_one') url_img__vehicle_inside_one: string,
        @Args('url_img__vehicle_inside_two') url_img__vehicle_inside_two: string,
        @Args('url_img__vehicle_inside_three') url_img__vehicle_inside_three: string,
        @Args('url_img__vehicle_inside_four') url_img__vehicle_inside_four: string,
        @Args('url_img_insurance') url_img_insurance: string,
        @Args('url_img_vehicle_circulation') url_img_vehicle_circulation: string,
        @Args('url_img_mechanical_inspection') url_img_mechanical_inspection: string,
        @Args('url_img_gas_emission') url_img_gas_emission: string,
        @Args('url_img_license_plate') url_img_license_plate: string) {
        return this.agentService.registerCompleteDataAgent(
            firtsname,
            lastname,
            email,
            username,
            password,
            address,
            phone,
            idcountry,
            idcity,
            identity,
            license_plate,
            idcattravel,
            id_vehicle_catalog,
            idtrademark,
            idmodel,
            idyear,
            url_img_identity,
            url_img_verify_identity,
            url_img_letterone_recomendation,
            url_img_lettertwo_recomendation,
            url_img_driver_license,
            url_img_police_record,
            url_img_driving_record,
            url_img__vehicle_front,
            url_img__vehicle_behind,
            url_img__vehicle_side_right,
            url_img__vehicle_side_left,
            url_img__vehicle_inside_one,
            url_img__vehicle_inside_two,
            url_img__vehicle_inside_three,
            url_img__vehicle_inside_four,
            url_img_insurance,
            url_img_vehicle_circulation,
            url_img_mechanical_inspection,
            url_img_gas_emission,
            url_img_license_plate);

    }
    @Mutation()
    async registerAgent(@Args('input') input: AgentInput) {
        return this.agentService.register(input);
    }

    @Mutation()
    async deleteAgent(@Args('idagent') idagent: number) {
        return this.agentService.delete(idagent);
    }

    @Mutation()
    async updateState(@Args('idagent') idagent: number) {
        return this.agentService.updateStateAgent(idagent);
    }

    @UseGuards(new AuthGuard())
    @Mutation()
    async updateAgent(@Args('input') input: AgentInput) {
        return this.agentService.update(input);
    }
}
