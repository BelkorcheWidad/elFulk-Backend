import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { ParentService } from '../parent/parent.service';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let betterAuthService: { api: { signInEmail: jest.Mock } };
  let parentService: Record<string, jest.Mock>;

  const mockSession = {
    session: {
      id: 'sess-id',
      token: 'sess-token',
      userId: 'user-uuid',
      expiresAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: null,
      userAgent: null,
    },
    user: {
      id: 'user-uuid',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      phone_number: null,
      lock_alerts: false,
      limit_warning: false,
      is_active: true,
    },
  };

  beforeEach(async () => {
    betterAuthService = {
      api: {
        signInEmail: jest.fn(),
      },
    };

    parentService = {
      findByUserId: jest.fn(),
      activatePin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: betterAuthService },
        { provide: ParentService, useValue: parentService },
      ],
    }).compile();

    controller = module.get(AuthController);
  });

  describe('login', () => {
    it('should call signInEmail and return access_token', async () => {
      const dto: LoginDto = { email: 'test@example.com', password: 'pass123' };
      betterAuthService.api.signInEmail.mockResolvedValue({
        token: 'jwt-token',
        user: { id: 'uid' },
      });

      const result = await controller.login(dto);

      expect(result).toEqual({ access_token: 'jwt-token' });
      expect(betterAuthService.api.signInEmail).toHaveBeenCalledWith({
        body: {
          email: 'test@example.com',
          password: 'pass123',
        },
      });
    });

    it('should throw UnauthorizedException on failed signIn', async () => {
      const dto: LoginDto = { email: 'test@example.com', password: 'wrong' };
      betterAuthService.api.signInEmail.mockRejectedValue(
        new Error('Invalid credentials'),
      );

      await expect(controller.login(dto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('getProfile', () => {
    it('should return the session user', () => {
      const result = controller.getProfile(mockSession);

      expect(result).toBe(mockSession.user);
    });
  });

  describe('activatePin', () => {
    it('should activate pin for the authenticated parent', async () => {
      const parent = { id: 'parent-uuid', userId: 'user-uuid' };
      parentService.findByUserId.mockResolvedValue(parent);
      parentService.activatePin.mockResolvedValue({
        message: 'Parent mode activated successfully',
      });

      const result = await controller.activatePin(mockSession, { pin: '1234' });

      expect(result).toEqual({ message: 'Parent mode activated successfully' });
      expect(parentService.findByUserId).toHaveBeenCalledWith('user-uuid');
      expect(parentService.activatePin).toHaveBeenCalledWith(
        'parent-uuid',
        '1234',
      );
    });

    it('should throw when parent not found', async () => {
      parentService.findByUserId.mockRejectedValue(new Error('not found'));

      await expect(
        controller.activatePin(mockSession, { pin: '1234' }),
      ).rejects.toThrow('not found');
    });
  });
});
