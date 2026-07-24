import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { auth } from '../../auth';
import { ActivatePinDto } from '../parent/dto/activate-pin.dto';
import { ParentService } from '../parent/parent.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly parentService: ParentService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user from session' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Session() session: UserSession<typeof auth>) {
    return session.user;
  }

  @Post('activate-pin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate parent mode with a 4-digit PIN' })
  @ApiResponse({ status: 200, description: 'Parent mode activated' })
  @ApiResponse({ status: 400, description: 'Already activated or invalid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async activatePin(
    @Session() session: UserSession<typeof auth>,
    @Body() dto: ActivatePinDto,
  ) {
    const parent = await this.parentService.findByUserId(session.user.id);
    return this.parentService.activatePin(parent.id, dto.pin);
  }
}
