import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from 'typeorm';
import { SkiperSubCatCommerces } from '../skiper-sub-cat-commerces/skiper-sub-cat-commerces.entity';


@Entity('skiper_cat_commerces')
export class SkiperCatCommerce {

    @PrimaryGeneratedColumn() id: number;

    @Column('varchar', { length: 50, nullable: false }) name: string;

    @Column('boolean') state: boolean;

    @Column('longtext', { nullable: false }) url_img_category: string;

    @Column('longtext', { nullable: false }) url_img_category_temp: string;

    @OneToMany(type => SkiperSubCatCommerces, x => x.catcommerce)
    subcatcommerce: SkiperSubCatCommerces[];
}
