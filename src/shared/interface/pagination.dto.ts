import { Type } from "class-transformer";
import { IsNumber, Max, Min } from "class-validator";
import { IPaginationLinks, IPaginationMeta } from 'nestjs-typeorm-paginate';

export class PaginationSearchDto {
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    page: number;

    @IsNumber()
    @Min(1)
    @Max(9999)
    @Type(() => Number)
    limit: number;
}


export class PaginationWithChildren<T> {
    constructor(
        public items: T[],
        public meta: PaginationMeta,
        public links?: IPaginationLinks,
    ) { }
}

export class PaginationMeta implements IPaginationMeta {
    totalItemsWithChildren: number;
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
}