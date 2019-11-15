import { Controller, Post, Response, Request } from '@nestjs/common';
import { AppService } from './app.service';

@Controller("app")
export class AppController {

    constructor(private readonly service: AppService) { }

    @Post("data")
    uploadImage(@Request() request: any, @Response() response): any {
        console.log(request.body);
        response.body = { message: "Llegue bien al servicio", statusCode: 200, ok: true }
        console.log(response.body)
        return { data: response.body } ;
    }
}