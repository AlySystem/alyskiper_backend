import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, BeforeInsert, OneToMany } from 'typeorm';
import { Min, IsOptional, MaxLength } from 'class-validator';
import { Countrie } from '../countries/countrie.entity';
import { Cities } from '../cities/cities.entity';
import * as bcrypt from 'bcryptjs';
import { UserCivilStatus } from '../user-civil-status/user-civil-status.entity';
import { SkiperAgent } from '../skiper-agent/skiper-agent.entity';
import { SkiperWallet } from '../skiper-wallet/skiper-wallet.entity';
import { SkiperRating } from '../skiper-rating/skiper-rating.entity';

@Entity('employes')
export class Employes {

    @PrimaryGeneratedColumn() id: number;

    @Column({ nullable: false, length: 100 })
    @MaxLength(100) firstname: string;

    @Column({ nullable: false, length: 100 })
    @MaxLength(100) lastname: string;

    @Column({ nullable: false, unique: true, length: 100 })
    @MaxLength(100) email: string;

    @Column({ nullable: true, length: 50 })
    @MaxLength(50) user: string;

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, parseInt(process.env.SALT));
    }

    @Column({ nullable: false }) idcountry: number;

    @Column({ nullable: false }) idcity: number;

    @Column({ length: 255 })
    @Min(8, { message: 'the password must be have 8 characters at least' }) @MaxLength(255) password: string;

    @Column({ nullable: true, length: 255 }) @MaxLength(255) address: string;

    @Column({ nullable: false, length: 100 }) phone: string;


    @Column('date', { nullable: true }) create_at: Date;

    @Column('date', { nullable: false }) date_birth: Date;


    @Column('longtext', { nullable: true }) avatar: string;

    @ManyToOne(type => Countrie, { nullable: false })
    @JoinColumn({ name: 'idcountry' }) country: Countrie;

    @ManyToOne(type => Cities, { nullable: true })
    @JoinColumn({ name: 'idcity' }) city: Cities;

    @ManyToOne(type => UserCivilStatus, { nullable: true })
    @JoinColumn({ name: 'idcivil_status' }) civilStatus: UserCivilStatus;

    @OneToMany(type => SkiperAgent, x => x.user)
    skiperAgent: SkiperAgent[];

    @OneToMany(type => SkiperWallet, x => x.userID)
    skiperWallet: SkiperWallet[];

    @OneToMany(type => SkiperRating, x => x.iduser)
    SkiperRating: SkiperRating[];
}