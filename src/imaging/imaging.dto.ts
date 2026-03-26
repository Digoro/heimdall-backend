import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { ImagingMode } from "src/catalog/catalog.dto";
import { ProductLevel } from "src/product/product.dto";

export class CollectConstraint {
    @ApiProperty({ example: ImagingMode.Stripmap })
    @IsEnum(ImagingMode)
    imagingMode: ImagingMode;

    @ApiProperty({ example: 0.5 })
    @IsOptional()
    @IsNumber()
    resolution?: number;

    @ApiProperty({ example: 'Seoul' })
    @IsOptional()
    @IsString()
    targetName?: string;

    @ApiProperty({ example: ProductLevel.L1A })
    @IsEnum(ProductLevel)
    productLevel: ProductLevel;
}

export class CornerCoordinates {
    @IsObject()
    topLeft: { x: number; y: number };
    @IsObject()
    topRight: { x: number; y: number };
    @IsObject()
    bottomLeft: { x: number; y: number };
    @IsObject()
    bottomRight: { x: number; y: number };
}

export enum GeometryType {
    POINT = "Point",
    POLYGON = "Polygon"
}

export class Geometry {
    @ApiProperty({ example: GeometryType.POLYGON })
    @IsEnum(GeometryType)
    type: GeometryType;

    @ApiProperty({
        example: {
            topLeft: { x: 50, y: 100 },
            topRight: { x: 50, y: 100 },
            bottomLeft: { x: 50, y: 100 },
            bottomRight: { x: 50, y: 100 },
        }
    })
    @ValidateNested()
    @Type(() => CornerCoordinates)
    cornerCoordinates: CornerCoordinates;
}

export class TaskProperty {
    @ApiProperty({ example: new Date().toISOString() })
    @IsDate()
    @Type(() => Date)
    windowOpen: Date;

    @ApiProperty({ example: new Date().toISOString() })
    @IsDate()
    @Type(() => Date)
    windowClose: Date;

    @ApiProperty()
    @ValidateNested()
    @Type(() => CollectConstraint)
    collectConstraint: CollectConstraint;
}