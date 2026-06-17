import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsDateString, IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";
import { Geometry, TaskProperty } from "src/imaging/imaging.dto";
import { ProductType } from "src/product/product.dto";
import { PaginationSearchDto } from "src/shared/interface/pagination.dto";

export enum OrderType {
    ARCHIVE = "Archive",
    TASK = "Task"
}

// RECEIVED: 주문 접수
// ESTIMATING: 비용/일정 산출
// REJECTED: 관리자 거절
// PENDING: 사용자 검토 대기
// CANCELED: 사용자 취소
// APPROVED: 사용자 승인
// SCHEDULED: 촬영 계획 확정
// COLLECTING: 영상 수집 중
// PROCESSING: 영상 처리 중
// FAILED: 실패
// QA: 품질 검수 중
// DELIVERED: 제공 완료
export enum OrderStatus {
    RECEIVED = "Received",
    ESTIMATING = "Estimating",
    REJECTED = "Rejected",
    PENDING = "Pending",
    CANCELED = "Canceled",
    APPROVED = "Approved",
    SCHEDULED = "Scheduled",
    COLLECTING = "Collecting",
    PROCESSING = "Processing",
    FAILED = "Failed",
    QA = "QA",
    DELIVERED = "Delivered",
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

export class OrderStatusUpdateDto {
    @IsEnum(OrderStatus)
    status: OrderStatus;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsDateString()
    estimatedCollectionDate?: Date;

    @IsOptional()
    @IsDateString()
    estimatedDeliveryDate?: Date;
}

export class ArchiveOrderRequestDto {
    @ApiProperty({ example: 'cosmos', description: 'collection id' })
    @IsString()
    collectionId: string;

    @ApiProperty({ example: 'COSMOS_2026042201_SM_SLC_VV_20260422100000_20260422100025', description: 'item id' })
    @IsString()
    itemId: string;

    @ApiProperty({ example: ProductType.SLC, description: 'product type' })
    @IsEnum(ProductType)
    productType: ProductType;
}

export class TaskOrderRequestDto {
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