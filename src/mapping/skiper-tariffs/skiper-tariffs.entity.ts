import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { SkiperDriverSchedule } from "../skiper-driver-schedule/skiper-driver-schedule.entity";
import { SkiperCatTravel } from "../skiper-cat-travels/skiper-cat-travel.entity";
import { Countrie } from "../countries/countrie.entity";
import { Cities } from "../cities/cities.entity";

@Entity('skiper_tariffs_travels')
export class SkiperTariffs {

    @PrimaryGeneratedColumn() id: number;

    @Column('decimal', { nullable: false }) price_base: number;
    @Column('decimal', { nullable: false }) price_minute: number;
    @Column('decimal', { nullable: false }) price_kilometer: number;
    @Column('decimal', { nullable: false }) price_minimum: number;
    @Column('decimal', { nullable: false }) id_driver_schedule: number;
    @Column('decimal', { nullable: false }) id_skiper_cat_travels: number;
    @Column('decimal', { nullable: false }) idcountry: number;
    @Column('decimal', { nullable: false }) idcity: number;
    @Column('varchar', { nullable: false }) symbol: string;

    @ManyToOne(type => SkiperDriverSchedule, { nullable: false })
    @JoinColumn({ name: 'id_driver_schedule' }) driverShedule: SkiperDriverSchedule;

    @ManyToOne(type => SkiperCatTravel, { nullable: false })
    @JoinColumn({ name: 'id_skiper_cat_travels' }) skiperCatTravel: SkiperCatTravel;

    @ManyToOne(type => Countrie, { nullable: false })
    @JoinColumn({ name: 'idcountry' }) countrie: Countrie;

    @ManyToOne(type => Cities, { nullable: false })
    @JoinColumn({ name: 'idcity' }) cities: Cities;
}
