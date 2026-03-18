import { ApiProperty } from "@nestjs/swagger";

export class ErrorResponseDto {
    @ApiProperty({ example: 401 })
    statusCode: number;

    @ApiProperty({ example: 'Invalid API key' })
    message: string;

    @ApiProperty({ example: 'Unauthorized' })
    error: string;
}