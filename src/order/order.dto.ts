import { Type } from "class-transformer";
import { IsArray, IsEmail, IsEnum, IsOptional } from "class-validator";
import { PaginationSearchDto } from "src/shared/interface/pagination.dto";

export enum OrderType {
    ARCHVING_ORDER = "ArchvingOrder",
    TASKING_ORDER = "TaskingOrder"
}

export enum OrderStatus {
    Pending = "Pending",
    Approved = "Approved",
    Rejected = "Rejected",
    Completed = "Completed",
    Failed = "Failed",
    Canceled = "Canceled"
}

export class OrderSearchDto extends PaginationSearchDto {
    @IsOptional()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsArray()
    @IsEnum(OrderStatus, { each: true })
    @Type(() => Array)
    statusList: OrderStatus[];

    @IsOptional()
    @IsArray()
    @IsEnum(OrderType, { each: true })
    @Type(() => Array)
    typeList: OrderType[];
}