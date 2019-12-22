import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinTable, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { SkiperAgent } from '../skiper-agent/skiper-agent.entity';

@Entity('users_rating')
export class UsersRating {
    @PrimaryGeneratedColumn() id: number;

    @Column('int', { nullable: false }) idagent: number;

    @Column('int', { nullable: false }) iduser: number;

    @Column('decimal', { nullable: false }) ratingNumber: number;

    @Column('text', { nullable: false }) comments: string;

    @Column('datetime', { nullable: false }) created: Date;

    @Column('datetime', { nullable: false }) modified: Date;

    @Column('boolean', { nullable: false }) status: boolean;

    @ManyToOne(type => SkiperAgent, { nullable: false })
    @JoinColumn({ name: 'idagent' }) driver: SkiperAgent;

    @ManyToOne(type => User, { nullable: false })
    @JoinColumn({ name: 'iduser' }) user: User;
}