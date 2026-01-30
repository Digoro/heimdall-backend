import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { PaginationSearchDto } from 'src/shared/interface/pagination.dto';

export enum Role {
    ADMIN = "Admin",
    USER = "User",
}

export class UserSearchDto extends PaginationSearchDto {
    @IsOptional()
    @IsArray()
    @IsEnum(Role, { each: true })
    @Type(() => Array)
    roleList: Role[];
}

