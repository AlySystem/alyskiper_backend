import { Resolver, Args, Query, Mutation } from '@nestjs/graphql';
import { CommerceInput, CommerceResponse, AgentCommerceDto, CommerceOut } from './skiper-agent-commerce.dto';
import { SkiperAgentCommerceService } from './skiper-agent-commerce.service';
import { Logger } from '@nestjs/common';

@Resolver('SkiperAgentCommerce')
export class SkiperAgentCommerceResolver {

    private logger = new Logger('SkiperAgentCommerceResolver');

    constructor(
        private skiperAgentService: SkiperAgentCommerceService
    ){}

    @Query(() => [CommerceOut])
    async commerce() {
        return this.skiperAgentService.getAll();
    }

    @Query(() => CommerceOut)
    async commerceById(@Args('id') id: number){
        return this.skiperAgentService.getById(id);
    }

    @Mutation(() => CommerceResponse)
    async createCommerce(@Args('input') input: CommerceInput) {
        let commerce: AgentCommerceDto = this.parseCommerce(input);
        return await this.skiperAgentService.create(commerce);    
    }

    @Mutation(() => CommerceResponse)
    async updateCommerce(@Args('input') input: CommerceInput) {
        let commerce: AgentCommerceDto = this.parseCommerce(input);
        return await this.skiperAgentService.update(input.id,commerce);    
    }

    parseCommerce(input: CommerceInput): AgentCommerceDto{
        let result: AgentCommerceDto = new AgentCommerceDto();
        result.identity = input.identity;
        result.name_owner = input.name_owner;
        result.state = input.state;
        result.url_doc_identity = input.url_doc_identity;
        result.userId = input.userId;
        return result;
    }
}