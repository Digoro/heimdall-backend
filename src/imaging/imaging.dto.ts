import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsDate, IsEnum, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { ImagingMode } from "src/catalog/catalog.dto";
import { ProductType } from "src/product/product.dto";

// CRITICAL: 가장 긴급, 거의 즉시 대응, 재난/군사/긴급 상황
// URGENT: URGENT 바로 아래 우선순위, 스케줄 상위 배치, 중요 감시 대상
// STANDARD: 일반적인 촬영 요청,
// FLEXIBLE: 긴급성 없음, 스케줄 가능할 때 아무때나 촬영, 가장 저렴
export enum Priority {
    CRITICAL = "Critical",
    URGENT = "Urgent",
    STANDARD = "Standard",
    FLEXIBLE = "Flexible"
}

export enum Polarization {
    VV = "VV",
    VH = "VH",
    HV = "HV",
    HH = "HH"
}

export enum OrbitDirection {
    BOTH = "Both",
    ASENDING = "Asending",
    DESENDING = "Desending"
}

export enum LookSide {
    BOTH = "Both",
    LEFT = "Left",
    RIGHT = "Right"
}

export class Geometry {
    @ApiProperty({ example: 'Polygon' })
    @IsString()
    type: string;

    @ApiProperty({
        example: [[
            [127.0, 37.5],
            [127.1, 37.5],
            [127.1, 37.6],
            [127.0, 37.6],
            [127.0, 37.5]
        ]]
    })
    @IsArray()
    @Type(() => Array)
    coordinates: number[][][];
}

export class CollectConstraint {
    @ApiProperty({ example: ImagingMode.STRIPMAP })
    @IsEnum(ImagingMode)
    imagingMode: ImagingMode;

    @ApiProperty({ example: Polarization.VV })
    @IsEnum(Polarization)
    polarization: Polarization;

    @ApiProperty({ example: 0.5 })
    @IsNumber()
    resolution: number;

    @ApiProperty({ example: 15 })
    @IsNumber()
    minIncidenceAngle: number;

    @ApiProperty({ example: 35 })
    @IsNumber()
    maxIncidenceAngle: number;

    @ApiProperty({ example: LookSide.LEFT })
    @IsEnum(LookSide)
    lookSide: LookSide;

    @ApiProperty({ example: OrbitDirection.ASENDING })
    @IsEnum(OrbitDirection)
    orbitDirection: OrbitDirection;
}

export class TaskProperty {
    @ApiProperty({ example: 'First SAR Imaging Request' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name: string;

    @ApiProperty({ example: 'SAR Imaging Request #1' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description: string;

    @ApiProperty({ example: Priority.STANDARD })
    @IsOptional()
    @IsEnum(Priority)
    priority: Priority;

    @ApiProperty({ example: new Date().toISOString() })
    @IsDate()
    @Type(() => Date)
    windowOpen: Date;

    @ApiProperty({ example: new Date().toISOString() })
    @IsDate()
    @Type(() => Date)
    windowClose: Date;

    @ApiProperty({ example: ProductType.SLC })
    @IsEnum(ProductType)
    productType: ProductType;

    @ApiProperty()
    @ValidateNested()
    @Type(() => CollectConstraint)
    collectConstraint: CollectConstraint;
}