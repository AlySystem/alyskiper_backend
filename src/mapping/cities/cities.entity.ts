import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Countrie } from "../countries/countrie.entity";
import { Max, Length } from "class-validator";
import { User } from "../users/user.entity";
import { AppCities } from "../app-cities/app-cities.entity";

@Entity('cities')
export class Cities {

    @PrimaryGeneratedColumn() id:number;

    @Max(80)
    @Column({nullable:false,length:80})
    name:string;
    
    @ManyToOne(type => Countrie,{nullable:false})
    @JoinColumn({name: 'idcountry'}) country:Countrie;

    @OneToMany(type => User, x => x.city)
    users: User[];

    @OneToMany(type => AppCities, x => x.cities)
    appCities: AppCities[];
}