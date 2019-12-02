import { PrimaryGeneratedColumn, Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { SkiperTravels } from '../skiper-travels/skiper-travels.entity';
import { SkiperTravelsStatus } from '../skiper-travels-status/skiper-travels-status.entity';


@Entity('skiper_travels_tracing')
export class SkiperTravelsTracing {
    @PrimaryGeneratedColumn() id: number;
    @Column('int', { nullable: false }) idtravel: number;
    @Column('int', { nullable: false }) idtravelstatus: number;
    @Column('datetime', { nullable: false }) datetracing: Date;
    @Column('double', { nullable: true }) lat: number;
    @Column('double', { nullable: true }) lng: number;

    @ManyToOne(type => SkiperTravels, { nullable: false })
    @JoinColumn({ name: 'idtravel' }) travel: SkiperTravels;

    @ManyToOne(type => SkiperTravelsStatus, { nullable: false })
    @JoinColumn({ name: 'idtravelstatus' }) travelstatus: SkiperTravelsStatus;
}
