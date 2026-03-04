import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
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

export class UserCreateDto {
    @IsEmail()
    @MaxLength(255)
    email: string;

    @IsOptional()
    @IsString()
    @MinLength(10)
    @MaxLength(20)
    password: string;

    @IsString()
    @MaxLength(20)
    name: string;

    @IsString()
    @MaxLength(20)
    department: string;
}