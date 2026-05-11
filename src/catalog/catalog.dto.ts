import { IsOptional } from "class-validator";

export enum ImagingMode {
    STRIPMAP = "Stripmap",
    SCANSAR = "ScanSAR",
    SPOTLIGHT_SINGLE = "Spotlight_Single",
    SPOTLIGHT_DWELL = "Spotlight_Dwell",
    SPOTLIGHT_SINGLE_UHR = "Spotlight_Single_UHR",
    SPOTLIGHT_DWELL_UHR = "Spotlight_Dwell_UHR"
}

export class SortByDto {
    field: string;

    direction: 'asc' | 'desc'
}

export class SearchDto {
    @IsOptional()
    bbox?: number[];

    @IsOptional()
    datetime?: string;

    @IsOptional()
    collections?: string[];

    @IsOptional()
    ids?: string[];

    @IsOptional()
    intersects?: object;

    @IsOptional()
    query?: Record<string, Record<string, any>>;

    @IsOptional()
    limit?: number = 10;

    @IsOptional()
    page?: number = 1;

    @IsOptional()
    sortBy?: SortByDto[];
}