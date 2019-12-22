import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('exchange_rate')
export class ExchangeRate {
    @PrimaryGeneratedColumn() id: number;
    @Column('int') idcountry: number;
    @Column('int') idcurrency: number;
    @Column('double') value: number;
    @Column('date') date_in: Date;
}