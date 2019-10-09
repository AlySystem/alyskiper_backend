import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppsInput} from './apps.dto';
import { Apps } from './apps.entity';

@Injectable()
export class AppsService {
    constructor(
        @InjectRepository(Apps) private readonly repository:Repository<Apps>
    ){}

    async getAll():Promise<Apps[]>{
        try {
            return await this.repository.find();
        } catch (error) {
            console.error(error)
        }
    }

    async getById(id:number):Promise<Apps>{
        return await this.repository.findOne({
            where: {id}
        });
    }

    async registerApp(input:AppsInput):Promise<Apps>{
        try 
        {
            let app = this.parseApp(input);
            console.log(app);
            return this.repository.save(app);
        } catch (error) {
            console.error(error)
        }
        return null;
    }

    private parseApp(input:AppsInput):Apps {
        let app:Apps = new Apps();
        app.name = input.name;
        app.description = input.description;
        return app;
    }
}
