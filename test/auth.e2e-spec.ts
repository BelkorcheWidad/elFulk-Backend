/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck — TODO: remove this file (Passport-era e2e test, incompatible with Better Auth)
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import request from 'supertest';
import type { App } from 'supertest/types';
import * as crypto from 'crypto';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { JwtStrategy } from '../src/modules/auth/strategies/jwt.strategy';
import { ParentService } from '../src/modules/parent/parent.service';

process.env.JWT_SECRET = 'test-secret';

const validPassword = 'testPassword123';
const now = new Date().toISOString();
const testParent = {
  id: '0192fc80-3d7c-7eb9-8000-7d0f1305e999',
  email: 'parent@example.com',
  username: 'testparent',
  password_hash: crypto
    .createHash('sha256')
    .update(validPassword)
    .digest('hex'),
  pin_activated: false,
  auth_provider: 'EMAIL' as const,
  is_active: true,
  created_at: now,
  updated_at: now,
};

const mockParentService = {
  findByEmail: jest.fn<(email: string) => Promise<typeof testParent | null>>(),
  findById: jest.fn<(id: string) => Promise<typeof testParent | null>>(),
  activatePin:
    jest.fn<(id: string, pin: string) => Promise<{ message: string }>>(),
};

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'test-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: ParentService, useValue: mockParentService },
  ],
  exports: [AuthService],
})
class TestAuthModule {}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.setGlobalPrefix('api/v1');
    await app.init();

    jwtService = moduleFixture.get(JwtService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    delete process.env.JWT_SECRET;
    await app.close();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 201 and an access token for valid credentials', async () => {
      mockParentService.findByEmail.mockResolvedValue(testParent);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'parent@example.com', password: validPassword })
        .expect(201);

      const body = response.body as Record<string, unknown>;
      expect(body).toHaveProperty('access_token');
      expect(typeof body.access_token).toBe('string');
      expect(mockParentService.findByEmail).toHaveBeenCalledWith(
        'parent@example.com',
      );
    });

    it('should return 401 for invalid email', async () => {
      mockParentService.findByEmail.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'unknown@example.com', password: 'any' })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return 401 for wrong password', async () => {
      mockParentService.findByEmail.mockResolvedValue(testParent);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'parent@example.com', password: 'wrongPassword' })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return 400 for invalid body (missing email)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ password: 'somepass' })
        .expect(400);
    });

    it('should return 400 for invalid body (missing password)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return 200 and the parent profile with a valid token', async () => {
      const token = jwtService.sign({
        sub: testParent.id,
        email: testParent.email,
      });
      mockParentService.findById.mockResolvedValue(testParent);

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual(testParent);
      expect(mockParentService.findById).toHaveBeenCalledWith(testParent.id);
    });

    it('should return 401 without a token', async () => {
      await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    });

    it('should return 401 with an invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return 401 with an expired token', async () => {
      const expiredToken = jwtService.sign(
        { sub: testParent.id, email: testParent.email },
        { expiresIn: '0s' },
      );

      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/activate-pin', () => {
    it('should return 200 and activate the PIN with a valid token', async () => {
      const token = jwtService.sign({
        sub: testParent.id,
        email: testParent.email,
      });
      const expected = { message: 'Parent mode activated successfully' };
      mockParentService.activatePin.mockResolvedValue(expected);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/activate-pin')
        .set('Authorization', `Bearer ${token}`)
        .send({ pin: '1234' })
        .expect(200);

      expect(response.body).toEqual(expected);
      expect(mockParentService.activatePin).toHaveBeenCalledWith(
        testParent.id,
        '1234',
      );
    });

    it('should return 401 without a token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/activate-pin')
        .send({ pin: '1234' })
        .expect(401);
    });

    it('should return 400 for invalid PIN format', async () => {
      const token = jwtService.sign({
        sub: testParent.id,
        email: testParent.email,
      });

      await request(app.getHttpServer())
        .post('/api/v1/auth/activate-pin')
        .set('Authorization', `Bearer ${token}`)
        .send({ pin: 'abc' })
        .expect(400);
    });
  });
});
