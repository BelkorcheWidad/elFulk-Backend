import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  AllowAnonymous,
  Session,
  UserSession,
  AuthService,
} from '@thallesp/nestjs-better-auth';
import { auth } from '../../auth';
import { LoginDto } from './dto/login.dto';
import { ActivatePinDto } from '../parent/dto/activate-pin.dto';
import { ParentService } from '../parent/parent.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly betterAuthService: AuthService<typeof auth>,
    private readonly parentService: ParentService,
  ) {}

  @Post('login')
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Returns session token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    try {
      const { token } = await this.betterAuthService.api.signInEmail({
        email: dto.email,
        password: dto.password,
      });
      return { access_token: token };
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Session() session: UserSession<typeof auth>) {
    return this.parentService.findByUserId(session.user.id);
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
