import { Injectable } from '@nestjs/common';
import { UploadImgAgent } from './upload-img-agent.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';
import { AllImagesDto } from './upload-img-agent.dto';

@Injectable()
export class UploadImgAgentService {
    constructor(
        @InjectRepository(UploadImgAgent)
        private readonly repository: Repository<UploadImgAgent>
    ) { }

    async getById(idagent: number): Promise<UploadImgAgent> {
        try {
            return await this.repository.findOneOrFail({ where: { id_skiper_agent: idagent } });
        } catch (error) {
            console.log(error)
        }
    }

    async getAllImages(idagent: number): Promise<AllImagesDto> {
        try {
            const entityManager = getManager()
            let sql =
            "select " +
            "sa.id," +
            "sa.`identity`," +
            "sa.iduser," +
            "uca.url_img_commerceinside_four," +
            "uca.url_img_commerceinside_one," +
            "uca.url_img_commerceinside_three," +
            "uca.url_img_commerceinside_two," +
            "uca.url_img_commerceoutside_one," +
            "uca.url_img_commerceoutside_two," +
            "uia.url_img_driver_license," +
            "uia.url_img_driving_record," +
            "uia.url_img_identity," +
            "uia.url_img_letterone_recomendation," +
            "uia.url_img_lettertwo_recomendation," +
            "uia.url_img_police_record," +
            "uia.url_img_verify_identity," +
            "ucld.url_img_identification_ruc," +
            "ucld.url_img_power_letter_four," +
            "ucld.url_img_power_letter_one," +
            "ucld.url_img_power_letter_three," +
            "ucld.url_img_power_letter_two," +
            "ucld.url_img_trade_registration" +
            ",sva.idagent" +
            ",sva.idvehicle" +
            ",uva.url_img_vehicle_behind" +
            ",uva.url_img_vehicle_front" +
            ",uva.url_img_vehicle_inside_four" +
            ",uva.url_img_vehicle_inside_one" +
            ",uva.url_img_vehicle_inside_three" +
            ",uva.url_img_vehicle_inside_two" +
            ",uva.url_img_vehicle_side_left" +
            ",uva.url_img_vehicle_side_right" +
            ",uvld.url_img_gas_emission" +
            ",uvld.url_img_insurance" +
            ",uvld.url_img_license_plate" +
            ",uvld.url_img_mechanical_inspection" +
            ",uvld.url_img_vehicle_circulation " +
            "from skiper_agent sa " +
            "left outer join skiper_commerces sc on sc.idagent = sa.id " +
            "left outer join upload_commerce_appearance uca on sc.id = uca.idcommerce " +
            "left outer join upload_commerce_legal_doc ucld on sc.id = ucld.idcommerce " +
            "left outer join upload_img_agent uia on sa.id = uia.id_skiper_agent " +
            "left outer join skiper_vehicle_agent sva on sa.id = sva.idagent " +
            "left outer join upload_vehicle_appearance uva on sva.idvehicle = uva.skiperVehicleId " +
            "left outer join upload_vehicle_legal_doc uvld on sva.idvehicle = uvld.idvehicle " +            
            "where sa.id = ?"
            
            const data = entityManager.query(sql,[idagent])
            console.log(data)
            return await data
        } catch (err) {
            console.log(err)
        }
    }

}
