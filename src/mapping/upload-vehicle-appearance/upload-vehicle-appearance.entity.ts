import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { SkiperVehicle } from "../skiper-vehicle/skiper-vehicle.entity";

@Entity()
export class UploadVehicleAppearance {

    @PrimaryGeneratedColumn() id: number;
    @Column('longtext', { nullable: true }) url_img_vehicle_front: string;
    @Column('longtext', { nullable: true }) url_img_vehicle_behind: string;
    @Column('longtext', { nullable: true }) url_img_vehicle_side_right: string;
    @Column('longtext', { nullable: true }) url_img_vehicle_side_left: string;
    @Column('longtext', { nullable: true }) url_img_vehicle_inside_one: string;
    @Column('longtext', { nullable: true }) url_img_vehicle_inside_two: string;
    @Column('longtext', { nullable: true }) url_img_vehicle_inside_three: string;
    @Column('longtext', { nullable: true }) url_img_vehicle_inside_four: string;
    @Column('int', { nullable: false }) skiperVehicleId: number;

    //Falta el Objeto de tipo skiper_vehicle
    @OneToOne(type => SkiperVehicle, skiperVehicle => skiperVehicle.uploadVehicleAppearance)
    @JoinColumn({ name: "skiperVehicleId" })
    skiperVehicle: SkiperVehicle;
}
