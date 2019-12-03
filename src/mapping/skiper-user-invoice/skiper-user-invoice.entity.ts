import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from '../users/user.entity';
import { SkiperAgent } from '../skiper-agent/skiper-agent.entity';
import { Countrie } from '../countries/countrie.entity';
import { SkiperInvoiceDetail } from '../skiper-invoice-detail/skiper-invoice-detail.entity';



@Entity('skiper_user_invoice')
export class SkiperUserInvoice {
    @PrimaryGeneratedColumn() id: number;
    @Column('int', { nullable: false }) numfac: number;
    @Column('int', { nullable: false }) iduser: number;
    @Column('int', { nullable: false }) anyagent: number;
    @Column('int', { nullable: false }) idcountry: number;
    @Column('datetime', { nullable: false }) date_in: Date;

    @ManyToOne(type => User, { nullable: false })
    @JoinColumn({ name: 'iduser' }) user: User;

    @ManyToOne(type => SkiperAgent, { nullable: false })
    @JoinColumn({ name: 'anyagent' }) agent: SkiperAgent;

    @ManyToOne(type => Countrie, { nullable: false })
    @JoinColumn({ name: 'idcountry' }) country: Countrie;

    @OneToMany(type => SkiperInvoiceDetail, x => x.invoice) invoices: SkiperInvoiceDetail[];

}