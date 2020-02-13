import { Resolver, Args, Mutation, Subscription } from '@nestjs/graphql';
import { Logger, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { signInDto, SignResponse, ErrorResponse, twilioDto } from './auth.dto';
import { AuthService } from './auth.service';
import { UserInput, UserUpdatePassword } from '../mapping/users/user.dto';
import { AuthGuard } from '../shared/auth.guard';

const pubSub = new PubSub();

@Resolver('Auth')
export class AuthResolver {

    private logger = new Logger('AuthResolver');

    constructor(
        private readonly authService: AuthService
    ) { }

    @Mutation()
    async signin(
        @Args('input') input: signInDto,
        @Args('lat') lat: number,
        @Args('lng') lng: number) {
        let result = await this.authService.login(input, lat, lng);
        pubSub.publish('userLogged', { userLogged: result });
        return result;
    }

    @Mutation()
    async signup(@Args('input') input: UserInput) {
        return await this.authService.register(input);
    }

    @Mutation()
    async send_code(@Args('sendcode') sendcode: twilioDto) {
        return this.authService.sendCode(sendcode);
    }

    @Mutation()
    async verify_code(@Args('verifycode') verifycode: twilioDto) {
        return this.authService.verifyCode(verifycode);
    }

    @Mutation()
    async reset_password(@Args('phone_number') phone_number: string) {
        return this.authService.reset(phone_number);
    }

    @Mutation()
    editPassword(@Args('input') input: UserUpdatePassword) {
        return this.authService.editPassowrd(input);
    }

    @UseGuards(new AuthGuard())
    @Mutation()
    async logout(@Args('id', ParseIntPipe) id: number) {
        return this.authService.logout(id);
    }

    @Subscription('userLogged')
    userLogged() {
        return pubSub.asyncIterator('userLogged');
    }
}
