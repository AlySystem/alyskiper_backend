import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from "typeorm";
import { SkiperCommerce } from "../skiper-commerce/skiper-commerce.entity";
import { SkiperCatProductsCommerce } from "../skiper-cat-product-commerce/skiper-cat-products-commerce.entity";


@Entity()
export class SkiperProductCommerce {
    
    @PrimaryGeneratedColumn() id:number;

    @Column('varchar',{nullable:true,length:50}) name:string;

    @Column('varchar',{nullable:true,length:500})description:string;

    @Column('longtext',{nullable:true}) url_img_product:string;

    @Column('double',{nullable:true}) price:number;

    @Column('boolean',{nullable:true}) isSize:boolean;

    @Column('boolean',{nullable:true}) isAddon:boolean;

    @Column({nullable:true}) discount:number;

    @ManyToOne(type => SkiperCommerce, {nullable: false})
    @JoinColumn({name:'id_skiper_commerce'}) skiperCommerce: SkiperCommerce;
    
    @ManyToOne(type => SkiperCatProductsCommerce, {nullable: false})
    @JoinColumn({name:'id_cat_product'}) skiperProducts: SkiperCatProductsCommerce;
}
