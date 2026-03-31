import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Geometry, TaskProperty } from "src/imaging/imaging.dto";
import { ProductType } from "src/product/product.dto";
import { PaginationSearchDto } from "src/shared/interface/pagination.dto";

export enum OrderType {
    ARCHVING_ORDER = "ArchvingOrder",
    TASKING_ORDER = "TaskingOrder"
}

export enum OrderStatus {
    PENDING = "Pending",
    APPROVED = "Approved",
    REJECTED = "Rejected",
    COMPLETED = "Completed",
    FAILED = "Failed",
    CANCELED = "Canceled"
}

export class OrderSearchDto extends PaginationSearchDto {
    @ApiHideProperty()
    @IsOptional()
    @IsString()
    email: string;

    @ApiProperty({ example: Object.values(OrderStatus), description: 'order status list' })
    @IsOptional()
    @IsArray()
    @IsEnum(OrderStatus, { each: true })
    @Type(() => Array)
    statusList: OrderStatus[];

    @ApiProperty({ example: Object.values(OrderType), description: 'order type list' })
    @IsOptional()
    @IsArray()
    @IsEnum(OrderType, { each: true })
    @Type(() => Array)
    typeList: OrderType[];
}

export class OrderUpdateDto {
    @IsOptional()
    @IsEnum(OrderStatus)
    status: OrderStatus;
}

export class ArchvingOrderRequestDto {
    @ApiProperty({ example: 1, description: 'catalog id' })
    @IsNumber()
    catalogId: number;

    @ApiProperty({ example: ProductType.SLC, description: 'product type' })
    @IsEnum(ProductType)
    productType: ProductType;
}

export class TaskingOrderRequestDto {
    @ApiProperty({ example: 'Feature' })
    @IsString()
    type: string;

    @ApiProperty()
    @ValidateNested()
    @Type(() => Geometry)
    geometry: Geometry;

    @ApiProperty()
    @ValidateNested()
    @Type(() => TaskProperty)
    properties: TaskProperty;
}