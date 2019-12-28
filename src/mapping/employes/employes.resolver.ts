import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { EmployesService } from './employes.service';
import { EmployesInput, EmployesUpdatePassword, EmployesUpdateInput, ChangePasswordEmailInput } from './employes.dto';
import { ParseIntPipe, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '../../shared/auth.guard';
@Resolver('Employes')
export class EmployesResolver {

    constructor(
        private readonly employesService: EmployesService
    ) { }

    @UseGuards(new AuthGuard())
    @Query()
    async users() {
        return await this.employesService.getAll();
    }

    // @UseGuards(new AuthGuard())
    @Query()
    searchUser(@Args('id', ParseIntPipe) id: number) {
        return this.employesService.findById(id);
    }

    @Query()
    searchUserByEmail(@Args('email') email: string) {
        return this.employesService.findByEmail(email);
    }

    @Query()
    searchUsersBySponsorId(@Args('id', ParseIntPipe) id: number) {
        return this.employesService.findBySponsorId(id);
    }

    @Query()
    GetUserWallets(@Args('id', ParseIntPipe) id: number) {
        return this.employesService.GetUserWallets(id)
    }

    @Mutation()
    async createUser(@Args('input') input: EmployesInput) {
        let result = await this.employesService.create(input);
        if (result) {
            return result;
        } else {
            return null;
        }
    }

    @Query()
    getUserWhenAddressNullAndSkiperAgentIdNull() {
        return this.employesService.getUserWhenAddressNullAndSkiperAgentIdNull();
    }

    @UseGuards(new AuthGuard())
    @Mutation()
    async updateUser(@Args('input') input: EmployesUpdateInput) {
        try {
            return await this.employesService.update(input);
        } catch (error) {
            console.log(error)
            return `Error resolver -> ${error}`
        }
    }

    @UseGuards(new AuthGuard())
    @Mutation()
    updatePassword(@Args('input') input: EmployesUpdatePassword) {
        return this.employesService.updatePassword(input);
    }

    @Mutation()
    async changePasswordByEmail(@Args('input') input: ChangePasswordEmailInput) {
        try {
            let result = await this.employesService.updatePasswordByEmail(input);           
            if (result) {
                return await true
            } else {
                return await false
            }
        } catch (error) {
            console.error(error);
        }
    }

    @Mutation()
    defaultPassword(@Args('id', ParseIntPipe) id: number) {
        return this.employesService.defaultPassword(id);
    }

    @Mutation()
    async setAvatarImage(@Args('id', ParseIntPipe) id: number, @Args('image') image: string) {
        return await this.employesService.updateAvatarImage(id, image);
    }

    @Mutation()
    async getAvatarImage(@Args('id', ParseIntPipe) id: number) {
        return await this.employesService.getAvatarImage(id);
    }
}