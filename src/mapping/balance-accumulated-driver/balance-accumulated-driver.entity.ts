import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('balanceAccumulatedDriver')
export class balanceAccumulatedDriver {
    @PrimaryGeneratedColumn() id: number;
    @Column('double', { nullable: false }) amount: number;
    @Column('int', { nullable: false }) userId: number;
    @Column('int', { nullable: false }) walletId: number;
    @Column('int', { nullable: false }) currencyId: number;
}