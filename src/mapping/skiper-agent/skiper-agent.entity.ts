import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, BeforeInsert } from "typeorm";
import { IsNotEmpty, IsBoolean, IsString, IsDate } from "class-validator";
import { CategoryAgent } from "../category-agent/categoty-agent.entity";
import { User } from "../users/user.entity";
import { SkiperVehicleAgent } from "../skiper-vehicle-agent/skiper-vehicle-agent.entity";
import { SkiperCommerce } from "../skiper-commerce/skiper-commerce.entity";
import { SkiperTravels } from "../skiper-travels/skiper-travels.entity";
import { SkiperRating } from '../skiper-rating/skiper-rating.entity';
@Entity()
export class SkiperAgent {

    @PrimaryGeneratedColumn() id: number;

    @Column('Int') iduser: number;

    @IsNotEmpty() @IsBoolean()
    @Column('boolean', { nullable: false }) state: boolean;

    @IsNotEmpty() @IsString()
    @Column('varchar', { nullable: false, length: 80 }) identity: string;

    @Column('int', { nullable: false }) idcategory_agent: number;

    @IsNotEmpty() @IsDate()
    @Column('date', { nullable: false }) create_at: Date;

    @ManyToOne(type => CategoryAgent, { nullable: false })
    @JoinColumn({ name: 'idcategory_agent' }) categoryAgent: CategoryAgent;

    @ManyToOne(type => User, { nullable: false })
    @JoinColumn({ name: 'iduser' }) user: User;

    @OneToMany(type => SkiperVehicleAgent, x => x.skiperAgent)
    skiperVehicleAgent: SkiperVehicleAgent[];

    @OneToMany(type => SkiperCommerce, x => x.skiperAgent)
    skiperCommerce: SkiperCommerce[];

    @OneToMany(type => SkiperTravels, x => x.skiperagent)
    skiperTravel: SkiperTravels[];

    @OneToMany(type => SkiperRating, x => x.iddriver)
    SkiperRating: SkiperRating[];

}