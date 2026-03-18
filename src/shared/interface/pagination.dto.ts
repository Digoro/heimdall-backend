import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, Max, Min } from "class-validator";
import { IPaginationMeta } from 'nestjs-typeorm-paginate';

export class PaginationSearchDto {
    @ApiProperty({
        example: '1',
        description: 'page number'
    })
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    page: number;

    @ApiProperty({
        example: '10',
        description: 'page size'
    })
    @IsNumber()
    @Min(1)
    @Max(9999)
    @Type(() => Number)
    limit: number;
}

export class PaginationDto<T> {
    items: T[];
    meta: PaginationMeta;
}

export class PaginationMeta implements IPaginationMeta {
    totalItemsWithChildren: number;

    @ApiProperty({ example: 10 })
    itemCount: number;

    @ApiProperty({ example: 120 })
    totalItems: number;

    @ApiProperty({ example: 10 })
    itemsPerPage: number;

    @ApiProperty({ example: 12 })
    totalPages: number;

    @ApiProperty({ example: 1 })
    currentPage: number;
}