import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { SkiperAgent } from "../skiper-agent/skiper-agent.entity";
import { Currency } from '../currency/currency.entity';

@Entity('executive_commissions')
export class ExecutiveCommissions {
    @PrimaryGeneratedColumn() id: number;
    @Column('int', { nullable: true }) agentID: number;
    @Column('int', { nullable: false }) idreference: number;
    @Column('double', { nullable: false }) amountcomission: number;
    @Column('int', { nullable: true }) idcurrency: number;
    @Column('boolean') state: boolean;
    @Column('datetime', { nullable: false }) date_in: Date;

    @ManyToOne(type => SkiperAgent, { nullable: false })
    @JoinColumn({ name: "agentID" }) agent: SkiperAgent;

    @ManyToOne(type => Currency, { nullable: false })
    @JoinColumn({ name: "idcurrency" }) currency: Currency;

}