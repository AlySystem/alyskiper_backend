import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('walletscompanies')
export class WalletsCompanies {
    @PrimaryGeneratedColumn() id: number;
    @Column('varchar') identifier: string;
    @Column('text') name_company: string;
    @Column('text') txt: string;
}