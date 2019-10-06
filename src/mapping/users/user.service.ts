import { Injectable, Logger } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInput } from './user.dto';
import { CitiesService } from '../cities/cities.service';
import { CountrieService } from '../countries/countrie.service';

@Injectable()
export class UserService {

    private logger = new Logger('UserService');
    
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly city: CitiesService,
        private readonly country: CountrieService
        ){}

    async getAll(): Promise<User[]> {
        return await this.userRepository.find({relations:["country","city"]});
    }

    async findById(id: number): Promise<User> {
        return await this.userRepository.findOne({
            where: {id:id},
            relations:["country","city"]
        });
    }

    //Usando paginacion para cargar los usuarios
    async userPages(page: number = 1): Promise<User[]> {
        const countries = await this.userRepository.find({
            take: 25,
            skip: 25 * (page - 1),
            order: { id: 'ASC' }
        });
        return countries;
    }

    async findByPhone(phone:string):Promise<User>{
        return await this.userRepository.findOne({ phone });
    }

    async findByEmail(email: string): Promise<User> {
        return await this.userRepository.findOne({
            where: {
                email: email
            }
        });
    }

    //Create a new user
    async create(input: UserInput): Promise<User>{
        try {
            let city = await this.city.getById(input.city_id);
            let country = await this.country.getById(input.country_id);
            if(city !== undefined && country !== undefined){
                let user: User = this.parseUser(input,city,country);
                return await this.userRepository.save(user);
            }
        } catch (error) {
            console.log(error)
        }
    }

    //Update a user
    async update(input: UserInput): Promise<User>{
        try {
            let userUpdate = await this.findById(input.id);
            userUpdate.firstname = input.firstname;
            userUpdate.lastname = input.lastname;
            userUpdate.email = input.email;
            userUpdate.country = await this.country.getById(input.country_id);
            userUpdate.phone = input.phone;
            return await this.userRepository.save(userUpdate);
        } catch (error) {
            console.log(error)
        }
    }

    // async changeState(id:number): Promise<User>{
    //     try {
    //         let userUpdate = await this.findById(id);
    //         return await this.userRepository.save(userUpdate);
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

    //Delete a user
    async delete(user: User) {
        return this.userRepository.delete(user);
    }

    async findByPayload(payload:any){
        const { user } = payload;
        return await this.userRepository.findOne({ user })
    }

    // Metodo para parsear de UserInput a User
    parseUser(input:UserInput,city?,country?): User{
        let user:User = new User();
        user.firstname = input.firstname;
        user.lastname = input.lastname;
        user.sponsor_id = input.sponsor_id;
        user.email = input.email;
        user.user = input.user;
        user.password = input.password;
        user.address = input.address;
        user.phone = input.phone;
        user.create_at = input.create_at;
        user.city = city
        user.country = country
        return user;
    }
}