import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('transaction_type')
export class TransactionType {
    
    @PrimaryGeneratedColumn() id: number;

    @Column('varchar', { nullable: false, length: 50 }) name: string;
}