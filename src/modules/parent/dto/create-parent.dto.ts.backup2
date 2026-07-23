import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthProvider } from '../parent.entity';

export class CreateParentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Plain-text password (will be hashed by Better Auth)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ description: 'Deprecated — use password instead' })
  @IsString()
  @IsOptional()
  password_hash?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  pin_hash?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiPropertyOptional({ enum: AuthProvider })
  @IsEnum(AuthProvider)
  @IsOptional()
  auth_provider?: AuthProvider;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  external_subject_id?: string;
}
