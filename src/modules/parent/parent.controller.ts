import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { auth } from '../../auth';
import { ParentService } from './parent.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { VerifyPinDto } from './dto/verify-pin.dto';
import { Parent } from './parent.entity';

@ApiTags('parents')
@Controller('parents')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Post()
  @ApiOperation({ summary: 'Link a Parent record to the authenticated user' })
  @ApiResponse({ status: 201, description: 'Parent created', type: Parent })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(
    @Session() session: UserSession<typeof auth>,
    @Body() dto: CreateParentDto,
  ): Promise<Parent> {
    return this.parentService.create(session.user.id, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated parent' })
  @ApiResponse({ status: 200, description: 'Parent profile', type: Parent })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@Session() session: UserSession<typeof auth>): Promise<Parent> {
    return this.parentService.findByUserId(session.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get parent by ID' })
  @ApiParam({ name: 'id', description: 'Parent UUID' })
  @ApiResponse({ status: 200, description: 'Parent found', type: Parent })
  @ApiResponse({ status: 404, description: 'Parent not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Parent> {
    return this.parentService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update parent (partial)' })
  @ApiParam({ name: 'id', description: 'Parent UUID' })
  @ApiResponse({ status: 200, description: 'Parent updated', type: Parent })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Parent not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateParentDto,
  ): Promise<Parent> {
    return this.parentService.update(id, dto);
  }

  @Post('verify-pin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify parent PIN' })
  @ApiResponse({ status: 200, description: 'PIN is valid' })
  @ApiResponse({ status: 401, description: 'Invalid PIN' })
  async verifyPin(
    @Session() session: UserSession<typeof auth>,
    @Body() dto: VerifyPinDto,
  ): Promise<{ valid: boolean }> {
    const parent = await this.parentService.findByUserId(session.user.id);
    await this.parentService.verifyPin(parent.id, dto.pin);
    return { valid: true };
  }
}
