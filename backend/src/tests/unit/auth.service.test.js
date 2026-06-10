import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import bcrypt from 'bcrypt';

jest.unstable_mockModule('../../repositories/user.repository.js', () => ({
  default: {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    updateLastLogin: jest.fn(),
    updatePassword: jest.fn(),
    setResetToken: jest.fn(),
    findByResetToken: jest.fn(),
    clearResetToken: jest.fn(),
    update: jest.fn(),
  },
}));

jest.unstable_mockModule('../../repositories/refreshToken.repository.js', () => ({
  default: {
    create: jest.fn(),
    findByHash: jest.fn(),
    revoke: jest.fn(),
    revokeAllForUser: jest.fn(),
  },
}));

jest.unstable_mockModule('../../repositories/activityLog.repository.js', () => ({
  default: { create: jest.fn() },
}));

const userRepository = (await import('../../repositories/user.repository.js')).default;
const refreshTokenRepository = (await import('../../repositories/refreshToken.repository.js')).default;
const activityLogRepository = (await import('../../repositories/activityLog.repository.js')).default;
const authService = (await import('../../services/auth.service.js')).default;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({ id: '1', name: 'Test', email: 'test@test.com' });
      refreshTokenRepository.create.mockResolvedValue({ id: 'token-1' });
      activityLogRepository.create.mockResolvedValue({});

      const result = await authService.register({
        name: 'Test',
        email: 'test@test.com',
        password: 'Password123!',
      });

      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(userRepository.create).toHaveBeenCalled();
    });

    it('should throw ConflictError for existing email', async () => {
      userRepository.findByEmail.mockResolvedValue({ id: '1', email: 'test@test.com' });

      await expect(
        authService.register({ name: 'Test', email: 'test@test.com', password: 'Password123!' })
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const hash = await bcrypt.hash('Password123!', 12);
      userRepository.findByEmail.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password_hash: hash,
        name: 'Test',
      });
      userRepository.updateLastLogin.mockResolvedValue();
      refreshTokenRepository.create.mockResolvedValue({ id: 'token-1' });
      activityLogRepository.create.mockResolvedValue({});

      const result = await authService.login({
        email: 'test@test.com',
        password: 'Password123!',
      });

      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
    });

    it('should throw UnauthorizedError for invalid password', async () => {
      const hash = await bcrypt.hash('Password123!', 12);
      userRepository.findByEmail.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password_hash: hash,
      });

      await expect(
        authService.login({ email: 'test@test.com', password: 'WrongPassword1!' })
      ).rejects.toThrow('Invalid email or password');
    });
  });
});
