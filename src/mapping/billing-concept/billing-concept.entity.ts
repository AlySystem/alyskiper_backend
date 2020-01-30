import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('billing_concept')
export class BillingConcept {
    @PrimaryGeneratedColumn() id: number;
    @Column('varchar', { nullable: false }) name: string;
}