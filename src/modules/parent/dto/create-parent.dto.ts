import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateParentDto {
  @ApiProperty({ example: 'fatima_ouali' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  pin_hash?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone_number?: string;
}
