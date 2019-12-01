import { InputType, ObjectType } from 'type-graphql';
import { UserDto } from '../users/user.dto';
import { CommerceDto } from '../skiper-commerce/skiper-commerce.dto';
import { SkiperOrderTracingDto } from '../skiper-order-tracing/skiper-order-tracing.dto';
import { SkiperOrderDetailDto, SkiperOrderDetailInput } from '../skiper-order-detail/skiper-order-detail.dto';


@InputType()
export class SkiperOrderInput {
    id: number;
    userphone: string;
    useraddress: string;
    orderdate: Date;
    totalprice: number;
    numitem: number;
    userID: number;
    commerceID: number;
}

@ObjectType()
export class SkiperOrderDto {
    id: number;
    userphone: string;
    useraddress: string;
    orderdate: Date;
    totalprice: number;
    numitem: number;
    user: UserDto;
    skiperCommerce: CommerceDto;
    skiperOrderTracing: SkiperOrderTracingDto;
    skiperOrderDetail: SkiperOrderDetailDto;
}