import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AuthController } from '../src/modules/auth/auth.controller';
import { ParentService } from '../src/modules/parent/parent.service';

const mockAuthService = {
  api: {
    signInEmail: jest.fn(),
  },
};

const mockParentService = {
  findByUserId: jest.fn(),
  activatePin: jest.fn(),
};

@Module({
  controllers: [AuthController],
  providers: [
    { provide: AuthService, useValue: mockAuthService },
    { provide: ParentService, useValue: mockParentService },
  ],
})
class TestAuthModule {}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

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
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 200 and an access token for valid credentials', async () => {
      mockAuthService.api.signInEmail.mockResolvedValue({
        token: 'sess-token',
        user: { id: 'uid' },
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'parent@example.com', password: 'pass123' })
        .expect(200);

      expect(response.body).toEqual({ access_token: 'sess-token' });
      expect(mockAuthService.api.signInEmail).toHaveBeenCalledWith({
        body: { email: 'parent@example.com', password: 'pass123' },
      });
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ password: 'pass123' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'parent@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for extra fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'parent@example.com',
          password: 'pass123',
          extra: 'field',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 on signIn failure', async () => {
      mockAuthService.api.signInEmail.mockRejectedValue(
        new Error('Invalid credentials'),
      );

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'parent@example.com', password: 'wrong' })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
});
