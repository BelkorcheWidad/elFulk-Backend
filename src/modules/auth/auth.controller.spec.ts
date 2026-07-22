import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ParentService } from '../parent/parent.service';
import { ActivatePinDto } from '../parent/dto/activate-pin.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Record<string, jest.Mock>;
  let parentService: Record<string, jest.Mock>;

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      getProfile: jest.fn(),
    };

    parentService = {
      activatePin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ParentService, useValue: parentService },
      ],
    }).compile();

    controller = module.get(AuthController);
  });

  describe('login', () => {
    it('should delegate to authService.login with the DTO', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'pass123',
      };
      const expected = { access_token: 'token' };
      authService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(result).toBe(expected);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('getProfile', () => {
    it('should delegate to authService.getProfile with the authenticated user id', async () => {
      const req = { user: { id: 'user-uuid' } };
      const expected = { id: 'user-uuid', email: 'test@example.com' };
      authService.getProfile.mockResolvedValue(expected);

      const result = await controller.getProfile(req);

      expect(result).toBe(expected);
      expect(authService.getProfile).toHaveBeenCalledWith('user-uuid');
    });
  });

  describe('activatePin', () => {
    it('should delegate to parentService.activatePin with user id and pin', async () => {
      const req = { user: { id: 'user-uuid' } };
      const dto: ActivatePinDto = { pin: '1234' };
      const expected = { message: 'Parent mode activated successfully' };
      parentService.activatePin.mockResolvedValue(expected);

      const result = await controller.activatePin(req, dto);

      expect(result).toBe(expected);
      expect(parentService.activatePin).toHaveBeenCalledWith(
        'user-uuid',
        '1234',
      );
    });
  });
});
