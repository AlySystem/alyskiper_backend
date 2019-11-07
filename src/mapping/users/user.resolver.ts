import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserInput, UserUpdatePassword, UserUpdateInput } from './user.dto';
import { ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../shared/auth.guard';
@Resolver('User')
export class UserResolver {

    constructor(
        private readonly userService: UserService
    ) { }

    @UseGuards(new AuthGuard())
    @Query()
    async users() {
        return await this.userService.getAll();
    }

    // @UseGuards(new AuthGuard())
    @Query()
    searchUser(@Args('id', ParseIntPipe) id: number) {
        return this.userService.findById(id);
    }

    @Query()
    searchUserByEmail(@Args('email') email: string) {
        return this.userService.findByEmail(email);
    }

    @Query()
    searchUsersBySponsorId(@Args('id', ParseIntPipe) id: number) {
        return this.userService.findBySponsorId(id);
    }

    @Query()
    GetUserWallets(@Args('id', ParseIntPipe) id: number){
        return this.userService.GetUserWallets(id)
    }

    @Mutation()
    async createUser(@Args('input') input: UserInput) {
        try {
            let result = await this.userService.create(input);
            return result;
        } catch (error) {
            return `Error resolver -> ${error}`
        }
    }

    @UseGuards(new AuthGuard())
    @Mutation()
    async updateUser(@Args('input') input: UserUpdateInput) {
        try {
            return await this.userService.update(input);
        } catch (error) {
            console.log(error)
            return `Error resolver -> ${error}`
        }
    }

    @UseGuards(new AuthGuard())
    @Mutation()
    updatePassword(@Args('input') input: UserUpdatePassword) {
        return this.userService.updatePassword(input);
    }

    @Mutation()
    defaultPassword(@Args('id',ParseIntPipe) id: number) {
        return this.userService.defaultPassword(id);
    }

    @Mutation()
    async setAvatarImage(@Args('id', ParseIntPipe) id: number, @Args('image') image: string) {
        return await this.userService.updateAvatarImage(id, image);
    }

    @Mutation()
    async getAvatarImage(@Args('id', ParseIntPipe) id: number) {
        return await this.userService.getAvatarImage(id);
    }
}