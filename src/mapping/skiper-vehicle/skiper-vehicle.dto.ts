import { ObjectType, InputType } from "type-graphql";
import { VehicleYearsDto } from "../vehicle-years/vehicle-years.dto";
import { VehicleModelsDto } from "../vehicle-models/vehicle-models.dto";
import { VehicleTrademarkDto } from "../vehicle-trademarks/vehicle-trademark.dto";
import { VehicleCatalogDto } from "../vehicle-catalog/vehicle-catalog.dto";
import { SkiperCatTravelDto } from "../skiper-cat-travels/skiper-cat-travel.dto";
import { SkiperVehicleAgentDto } from "../skiper-vehicle-agent/skiper-vehicle-agent.dto";
import { UploadVehicleAppearanceDto } from "../upload-vehicle-appearance/upload-vehicle-appearance.dto";

@InputType()
export class SkiperVehicleInput {
    id: number;
    license_plate: string;
    lat: string;
    lon: string;
    IdCatTravel: number;
    IdVehiclecatalog: number;
    IdTrademark: number;
    IdModel: number;
    IdYear: number;
}

@ObjectType()
export class SkiperVehicleDto {
    id: number;
    license_plate: string;
    lat: string;
    lon: string;
    skiperCatTravel: SkiperCatTravelDto;
    vehicleCatalog: VehicleCatalogDto;
    vehicleTrademark: VehicleTrademarkDto;
    vehicleModel: VehicleModelsDto;
    vehicleYear: VehicleYearsDto;
    skiperVehicleAgent: SkiperVehicleAgentDto;
    uploadVehicleAppearance: UploadVehicleAppearanceDto;
}
