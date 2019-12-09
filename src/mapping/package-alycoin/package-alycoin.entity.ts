import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity("package_alycoin")
export class PackageAlycoin {
    @PrimaryGeneratedColumn() id: number;
    @Column('varchar', { nullable: false }) name: string;
    @Column('int', { nullable: false }) price: number;
    @Column('text', { nullable: false }) img_url: string;
}