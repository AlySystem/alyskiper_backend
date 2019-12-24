import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from "typeorm";
import { SkiperAgent } from "../skiper-agent/skiper-agent.entity";

@Entity('upload_img_agent')
export class UploadImgAgent {

    @PrimaryGeneratedColumn() id: number;
    @Column('longtext', { nullable: false }) url_img_identity: string;
    @Column('int', { nullable: false }) id_skiper_agent: number;
    @Column('longtext', { nullable: false }) url_img_verify_identity: string;
    @Column('longtext', { nullable: false }) url_img_letterone_recomendation: string;
    @Column('longtext', { nullable: false }) url_img_lettertwo_recomendation: string;
    @Column('longtext', { nullable: false }) url_img_driver_license: string;
    @Column('longtext', { nullable: false }) url_img_police_record: string;
    @Column('longtext', { nullable: false }) url_img_driving_record: string;

    @ManyToOne(type => SkiperAgent, { nullable: false })
    @JoinColumn({ name: 'id_skiper_agent' }) skiperAgent: SkiperAgent;
}
