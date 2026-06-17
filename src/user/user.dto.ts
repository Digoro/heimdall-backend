import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEmail, IsEnum, IsNumber, IsOptional, IsString, Length, Matches } from 'class-validator';
import { PaginationSearchDto } from 'src/shared/interface/pagination.dto';

export enum Role {
    ADMIN = "Admin",
    USER = "User",
}

export class UserSearchDto extends PaginationSearchDto {
    @IsOptional()
    @IsString()
    term: string;

    @IsOptional()
    @IsArray()
    @IsEnum(Role, { each: true })
    @Type(() => Array)
    roles: Role[];
}

export class UserCreateDto {
    @IsEmail()
    @Length(1, 255)
    email: string;

    @IsString()
    @Length(8, 100)
    @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,100}$/, {
        message: 'Password must contain a mix of english letters and special characters.'
    })
    password: string;

    @IsString()
    @Length(1, 50)
    name: string;

    @IsString()
    @Length(1, 100)
    department: string;

    @IsOptional()
    @IsEnum(Role)
    role: Role;
}

export class UserUpdateDto extends PartialType(UserCreateDto) {
    @IsOptional()
    @IsNumber()
    dailyLimit: number;

    @IsOptional()
    @IsNumber()
    monthlyLimit: number;

    @IsOptional()
    @IsBoolean()
    isApproved: boolean;
}

export class UpdateWebhookDto {
    @IsString()
    webhookUrl: string;

    @IsOptional()
    @IsString()
    webhookSecret?: string;

    @IsBoolean()
    isEditWebhookSecret: boolean;
}
