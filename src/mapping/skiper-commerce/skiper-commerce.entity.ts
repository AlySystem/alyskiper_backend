import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Countrie } from "../countries/countrie.entity";
import { SkiperAgent } from "../skiper-agent/skiper-agent.entity";
import { SkiperCatCommerce } from "../skiper-cat-commerce/skiper-cat-commerce.entity";
import { Cities } from "../cities/cities.entity";
import { SkiperOrder } from "../skiper-order/skiper-order.entity";
import { SkiperCatProductsCommerce } from "../skiper-cat-product-commerce/skiper-cat-products-commerce.entity";

@Entity('skiper_commerces')
export class SkiperCommerce {

    @PrimaryGeneratedColumn() id: number;

    @Column('varchar', { nullable: true, length: 80 }) namecommerce: string;

    @Column('varchar', { nullable: false, length: 100 }) identification_ruc: string;

    @Column('varchar', { nullable: false, length: 80 }) phone: string;

    @Column('varchar', { nullable: false, length: 100 }) address: string;

    @Column('varchar', { nullable: false, length: 80 }) manager: string;

    @Column('boolean', { nullable: true }) state: boolean;

    @Column('varchar', { nullable: true, length: 255 }) lat: string;

    @Column('varchar', { nullable: true, length: 255 }) lon: string;

    @Column('longtext', { nullable: true }) url_art: string;

    @Column('longtext', { nullable: true }) url_logo: string;

    @Column('int',{nullable: false}) idagent:number;
    @Column('int',{nullable: false}) id_cat_commerce:number;
    @Column('int',{nullable: false}) idcountry:number;
    @Column('int',{nullable: false}) idcity:number;

    @ManyToOne(type => SkiperAgent, { nullable: false })
    @JoinColumn({ name: 'idagent' }) skiperAgent: SkiperAgent;

    @ManyToOne(type => SkiperCatCommerce, { nullable: false })
    @JoinColumn({ name: 'id_cat_commerce' }) catCommerce: SkiperCatCommerce;

    @ManyToOne(type => Countrie, { nullable: false })
    @JoinColumn({ name: 'idcountry' }) country: Countrie;

    @ManyToOne(type => Cities, { nullable: false })
    @JoinColumn({ name: 'idcity' }) city: Cities;

    @OneToMany(type => SkiperCatProductsCommerce, x => x.skiperCommerce)
    skiperCatProductsCommerce: SkiperCatProductsCommerce[];
}