import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from '../users/user.entity';
import { ConsecutiveInvoiceCountry } from '../consecutive-invoice-country/consecutive-invoice-country.entity';
import { SkiperAgent } from '../skiper-agent/skiper-agent.entity';



@Entity('skiper_user_invoice')
export class SkiperUserInvoice {
    @PrimaryGeneratedColumn() id: number;
    @Column('int', { nullable: false }) idconsecutive: number;
    @Column('int', { nullable: false }) iduser: number;
    @Column('int', { nullable: false }) anyagent: number;
    @Column('datetime', { nullable: false }) date_in: Date;

    @ManyToOne(type => User, { nullable: false })
    @JoinColumn({ name: 'iduser' }) user: User;

    @ManyToOne(type => ConsecutiveInvoiceCountry, { nullable: false })
    @JoinColumn({ name: 'idconsecutive' }) consecutive: ConsecutiveInvoiceCountry;

    @ManyToOne(type => SkiperAgent, { nullable: false })
    @JoinColumn({ name: 'anyagent' }) agent: SkiperAgent;
}