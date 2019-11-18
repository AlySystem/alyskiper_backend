import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('currency')
export class PaymentCryptoCurrency {
    @PrimaryGeneratedColumn() id: number;
    
}