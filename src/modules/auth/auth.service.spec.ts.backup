import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { ParentService } from '../parent/parent.service';

describe('AuthService', () => {
  let service: AuthService;
  let parentService: Record<string, jest.Mock>;
  let jwtService: Record<string, jest.Mock>;

  const validPassword = 'correctPassword';
  const mockParent = {
    id: '0192fc80-3d7c-7eb9-8000-7d0f1305e123',
    email: 'parent@example.com',
    password_hash: crypto
      .createHash('sha256')
      .update(validPassword)
      .digest('hex'),
  };

  beforeEach(async () => {
    parentService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ParentService, useValue: parentService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('login', () => {
    it('should return an access token for valid credentials', async () => {
      parentService.findByEmail.mockResolvedValue(mockParent);

      const result = await service.login({
        email: 'parent@example.com',
        password: validPassword,
      });

      expect(result).toEqual({ access_token: 'signed-jwt-token' });
      expect(parentService.findByEmail).toHaveBeenCalledWith(
        'parent@example.com',
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockParent.id,
        email: mockParent.email,
      });
    });

    it('should throw UnauthorizedException when parent is not found', async () => {
      parentService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password_hash is null', async () => {
      parentService.findByEmail.mockResolvedValue({
        ...mockParent,
        password_hash: null,
      });

      await expect(
        service.login({ email: 'parent@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password_hash is undefined', async () => {
      parentService.findByEmail.mockResolvedValue({
        ...mockParent,
        password_hash: undefined,
      });

      await expect(
        service.login({ email: 'parent@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      parentService.findByEmail.mockResolvedValue(mockParent);

      await expect(
        service.login({
          email: 'parent@example.com',
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return the parent profile for a valid id', async () => {
      const profile = {
        id: mockParent.id,
        email: mockParent.email,
        username: 'testparent',
      };
      parentService.findById.mockResolvedValue(profile);

      const result = await service.getProfile(mockParent.id);

      expect(result).toEqual(profile);
      expect(parentService.findById).toHaveBeenCalledWith(mockParent.id);
    });
  });
});
