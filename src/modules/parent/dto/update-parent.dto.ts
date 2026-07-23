import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateParentDto {
  @ApiPropertyOptional({ description: 'PIN hash (if re-setting)' })
  pin_hash?: string;

  @ApiPropertyOptional({ example: '+212600000001' })
  phone_number?: string;
}
