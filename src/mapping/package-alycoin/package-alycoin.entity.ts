import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity("package_alycoin")
export class PackageAlycoin {
    @PrimaryGeneratedColumn() id: number;
    @Column('varchar', { nullable: false }) name: string;
}