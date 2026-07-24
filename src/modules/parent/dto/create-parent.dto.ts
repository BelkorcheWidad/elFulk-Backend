import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateParentDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  pin_hash?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone_number?: string;
}
