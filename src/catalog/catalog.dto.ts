import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export enum ImagingMode {
    STRIPMAP = "Stripmap",
    SCANSAR = "ScanSAR",
    SPOTLIGHT_SINGLE = "Spotlight_Single",
    SPOTLIGHT_DWELL = "Spotlight_Dwell",
    SPOTLIGHT_DWELL_FIXEDPRF = "Spotlight_Dwell_FIXEDPRF",
    SPOTLIGHT_SINGLE_UHR = "Spotlight_Single_UHR",
    SPOTLIGHT_DWELL_UHR = "Spotlight_Dwell_UHR",
    SPOTLIGHT_DWELL_UHR_FIXEDPRF = "Spotlight_Dwell_UHR_FixedPRF"
}

export class SortByDto {
    field: string;

    direction: 'asc' | 'desc'
}

export class SearchDto {
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    bbox?: number[];

    @IsOptional()
    datetime?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    collections?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
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