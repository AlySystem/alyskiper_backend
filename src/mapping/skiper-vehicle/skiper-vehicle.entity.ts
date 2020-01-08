import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, OneToMany, OneToOne, JoinTable } from 'typeorm';
import { SkiperCatTravel } from "../skiper-cat-travels/skiper-cat-travel.entity";
import { VehicleCatalog } from "../vehicle-catalog/vehicle-catalog.entity";
import { VehicleTrademark } from "../vehicle-trademarks/vehicle-trademark.entity";
import { VehicleModels } from "../vehicle-models/vehicle-models.entity";
import { VehicleYears } from "../vehicle-years/vehicle-years.entity";
import { SkiperVehicleAgent } from "../skiper-vehicle-agent/skiper-vehicle-agent.entity";
import { UploadVehicleAppearance } from '../upload-vehicle-appearance/upload-vehicle-appearance.entity';

@Entity('skiper_vehicle')
export class SkiperVehicle {

    @PrimaryGeneratedColumn() id: number;

    @Column('varchar', { nullable: true, length: 30, unique: true }) license_plate: string;

    @Column({ nullable: true }) lat: string;

    @Column({ nullable: true }) lon: string;

    @Column({ nullable: true }) id_cat_travel: number;
    @Column({ nullable: true }) id_vehicle_catalog: number;
    @Column({ nullable: true }) idtrademark: number;
    @Column({ nullable: true }) idmodel: number;
    @Column({ nullable: true }) idyear: number;

    @ManyToOne(type => SkiperCatTravel, { nullable: false })
    @JoinColumn({ name: 'id_cat_travel' }) skiperCatTravel: SkiperCatTravel;

    @ManyToOne(type => VehicleCatalog, { nullable: false })
    @JoinColumn({ name: 'id_vehicle_catalog' }) vehicleCatalog: VehicleCatalog;

    @ManyToOne(type => VehicleTrademark, { nullable: false })
    @JoinColumn({ name: 'idtrademark' }) vehicleTrademark: VehicleTrademark;

    @ManyToOne(type => VehicleModels, { nullable: false })
    @JoinColumn({ name: 'idmodel' }) vehicleModel: VehicleModels;

    @ManyToOne(type => VehicleYears, { nullable: false })
    @JoinColumn({ name: 'idyear' }) vehicleYear: VehicleYears;

    @OneToMany(type => SkiperVehicleAgent, x => x.skiperVehicle)
    skiperVehicleAgent: SkiperVehicleAgent[];

    @OneToOne(type => UploadVehicleAppearance, uploadvehicleappearance => uploadvehicleappearance.skiperVehicle)
    uploadVehicleAppearance: UploadVehicleAppearance;

}
