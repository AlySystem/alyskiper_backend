import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { SkiperAgent } from '../skiper-agent/skiper-agent.entity';
import { SkiperTariffs } from '../skiper-tariffs/skiper-tariffs.entity';
import { SkiperTravelsTracing } from '../skiper-travels-tracing/skiper-travels-tracing.entity';
import { Currency } from '../currency/currency.entity';
import { Pay } from 'twilio/lib/twiml/VoiceResponse';
import { PaymentMethods } from '../payment-methods/payment-methods.entity';
import { SkiperCatTravel } from '../skiper-cat-travels/skiper-cat-travel.entity';

@Entity('skiper_travels')
export class SkiperTravels {
    @PrimaryGeneratedColumn() id: number;
    @Column('int', { nullable: true }) idusers: number;
    @Column('int', { nullable: true }) iddriver: number;
    @Column('int', { nullable: true }) idcurrency: number;
    @Column('int', { nullable: true }) idpayment_methods: number;
    @Column('double', { nullable: true }) lat_initial: number;
    @Column('double', { nullable: true }) lng_initial: number;
    @Column('double', { nullable: true }) lat_final_seggested: number;
    @Column('double', { nullable: true }) lng_final_seggested: number;
    @Column('double', { nullable: true }) lat_final: number;
    @Column('double', { nullable: true }) lng_final: number;
    @Column('datetime', { nullable: true }) date_init: Date;
    @Column('datetime', { nullable: true }) date_final: Date;
    @Column('double', { nullable: true }) distance: number;
    @Column('double', { nullable: true }) total: number;
    @Column({ nullable: true, length: 100 }) address_initial: string;
    @Column({ nullable: true, length: 100 }) address_final: string;
    @Column({ nullable: true, length: 100 }) address_suggested: string;
    @Column('double', { nullable: true }) duration: number;
    @Column('int', { nullable: true }) idcattravel: number;
    @Column('boolean') state: boolean;

    @ManyToOne(type => User, { nullable: true })
    @JoinColumn({ name: 'idusers' }) users: User;

    @ManyToOne(type => SkiperAgent, { nullable: true })
    @JoinColumn({ name: 'iddriver' }) skiperagent: SkiperAgent;

    @ManyToOne(type => Currency, { nullable: false })
    @JoinColumn({ name: 'idcurrency' }) currency: Currency;

    @ManyToOne(type => PaymentMethods, { nullable: false })
    @JoinColumn({ name: 'idpayment_methods' }) paymentMethods: PaymentMethods;

    @OneToMany(type => SkiperTariffs, x => x.driverShedule)
    skiperTariffs: SkiperTariffs[];

    @ManyToOne(type => SkiperCatTravel, { nullable: false })
    @JoinColumn({ name: "idcattravel" }) skipercattravel: SkiperCatTravel;

    @OneToMany(type => SkiperTravelsTracing, x => x.travel)
    skiperTravelsTracing: SkiperTravelsTracing[]
}