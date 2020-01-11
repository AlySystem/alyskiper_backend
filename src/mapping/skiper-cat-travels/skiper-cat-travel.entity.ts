import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('skiper_cat_travels')
export class SkiperCatTravel {
    @PrimaryGeneratedColumn() id: number;
    @Column({ length: 80, nullable: true }) name: string;
    @Column('longtext', { nullable: true }) url_img_category: string;
    @Column('varchar', { nullable: false }) url_img_drive: string;
    @Column('varchar', { nullable: false, length: 15 }) mode_drive: string;
    @Column('boolean', { nullable: false }) btaxy: boolean;
    @Column('boolean', { nullable: false }) bdelivery: boolean;
    @Column('boolean', { nullable: false }) btransporte: boolean;
    @Column('int', { nullable: true }) paycommission: number;
    @Column('int', { nullable: true }) percentageagent: number;
    @Column('longtext') urlImgName:string;

}