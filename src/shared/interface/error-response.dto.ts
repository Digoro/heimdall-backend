import { ApiProperty } from "@nestjs/swagger";

export class UnauthorizedErrorResponseDto {
    @ApiProperty({ example: 401 })
    statusCode: number;

    @ApiProperty({ example: 'Invalid API key' })
    message: string;

    @ApiProperty({ example: 'Unauthorized' })
    error: string;
}

export class NotFoundErrorResponseDto {
    @ApiProperty({ example: 404 })
    statusCode: number;

    @ApiProperty({ example: 'Not Found' })
    message: string;
}