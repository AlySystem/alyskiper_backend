import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, BeforeInsert, OneToMany } from 'typeorm';
import { Min, IsOptional, MaxLength } from 'class-validator';
import { Countrie } from '../countries/countrie.entity';
import { Cities } from '../cities/cities.entity';
import * as bcrypt from 'bcryptjs';
import { UserCivilStatus } from '../user-civil-status/user-civil-status.entity';
import { SkiperAgent } from '../skiper-agent/skiper-agent.entity';
import { SkiperWallet } from '../skiper-wallet/skiper-wallet.entity';
import { SkiperRating } from '../skiper-rating/skiper-rating.entity';

@Entity('users')
export class User {

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

    @Column({ nullable: true, default: 1 }) @IsOptional() sponsor_id: number;

    @Column({ nullable: true, length: 255 }) @MaxLength(255) address: string;

    @Column({ nullable: false, length: 100 }) phone: string;

    @BeforeInsert()
    defaultCreateAt() {
        if (this.create_at == null) {
            this.create_at = new Date();
        }
        if (this.sponsor_id == null) {
            this.sponsor_id = 1;
        }
        if (this.date_birth == null) {
            this.date_birth = new Date();
        }
        if (this.is_online == null) {
            this.is_online = false;
        }
    }

    @Column('date', { nullable: true }) create_at: Date;

    @Column('date', { nullable: false }) date_birth: Date;

    @Column('boolean', { nullable: true }) is_online: boolean;

    @Column('longtext', { nullable: true }) avatar: string;

    @Column('longtext', { nullable: true }) token_reset: string;
    @Column('datetime', { nullable: true }) resetPasswordExpires: string;
    @Column('int', { nullable: true }) pin: number;
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