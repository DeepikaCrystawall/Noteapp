import bcrypt from 'bcrypt';
import crypto from 'crypto';
import userRepository from '../repositories/user.repository.js';
import refreshTokenRepository from '../repositories/refreshToken.repository.js';
import activityLogRepository from '../repositories/activityLog.repository.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  parseExpiresIn,
} from '../utils/jwt.js';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from '../utils/errors.js';
import config from '../config/index.js';
import logger from '../config/logger.js';

const SALT_ROUNDS = 12;

class AuthService {
  async register({ name, email, password }, meta = {}) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new ConflictError('Email already registered');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create({ name, email, passwordHash });

    await activityLogRepository.create({
      userId: user.id,
      action: 'user_registered',
      entityType: 'user',
      entityId: user.id,
      metadata: {},
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });

    const tokens = await this._generateTokens(user, meta);
    return { user, ...tokens };
  }

  async login({ email, password }, meta = {}) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedError('Invalid email or password');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      logger.warn('Authentication failure', { email, ip: meta.ip });
      throw new UnauthorizedError('Invalid email or password');
    }

    await userRepository.updateLastLogin(user.id);
    await activityLogRepository.create({
      userId: user.id,
      action: 'user_logged_in',
      entityType: 'user',
      entityId: user.id,
      metadata: {},
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });

    const { password_hash, reset_token, reset_token_expires_at, ...safeUser } = user;
    const tokens = await this._generateTokens(safeUser, meta);
    return { user: safeUser, ...tokens };
  }

  async logout(refreshToken, userId) {
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      const stored = await refreshTokenRepository.findByHash(tokenHash);
      if (stored) await refreshTokenRepository.revoke(stored.id);
    }
    if (userId) {
      await activityLogRepository.create({
        userId,
        action: 'user_logged_out',
        entityType: 'user',
        entityId: userId,
        metadata: {},
      });
    }
  }

  async refreshTokens(refreshToken, meta = {}) {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await refreshTokenRepository.findByHash(tokenHash);
    if (!stored) throw new UnauthorizedError('Refresh token revoked or expired');

    const user = await userRepository.findById(decoded.sub);
    if (!user) throw new UnauthorizedError('User not found');

    await refreshTokenRepository.revoke(stored.id);
    const tokens = await this._generateTokens(user, meta);
    return { user, ...tokens };
  }

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) return { message: 'If the email exists, a reset link has been sent' };

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000);
    await userRepository.setResetToken(user.id, token, expiresAt);

    logger.info('Password reset requested', { userId: user.id, token });

    return { message: 'If the email exists, a reset link has been sent', resetToken: config.env === 'development' ? token : undefined };
  }

  async resetPassword({ token, password }) {
    const user = await userRepository.findByResetToken(token);
    if (!user) throw new ValidationError('Invalid or expired reset token');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await userRepository.updatePassword(user.id, passwordHash);
    await userRepository.clearResetToken(user.id);
    await refreshTokenRepository.revokeAllForUser(user.id);

    await activityLogRepository.create({
      userId: user.id,
      action: 'password_reset',
      entityType: 'user',
      entityId: user.id,
      metadata: {},
    });
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await userRepository.findByEmail(
      (await userRepository.findById(userId))?.email
    );
    if (!user) throw new NotFoundError('User not found');

    const fullUser = await userRepository.findByEmail(user.email);
    const valid = await bcrypt.compare(currentPassword, fullUser.password_hash);
    if (!valid) throw new UnauthorizedError('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.updatePassword(userId, passwordHash);
    await refreshTokenRepository.revokeAllForUser(userId);

    await activityLogRepository.create({
      userId,
      action: 'password_changed',
      entityType: 'user',
      entityId: userId,
      metadata: {},
    });
  }

  async updateProfile(userId, data) {
    if (data.email) {
      const existing = await userRepository.findByEmail(data.email);
      if (existing && existing.id !== userId) {
        throw new ConflictError('Email already in use');
      }
    }

    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email.toLowerCase();

    const user = await userRepository.update(userId, updateData);
    if (!user) throw new NotFoundError('User not found');

    await activityLogRepository.create({
      userId,
      action: 'profile_updated',
      entityType: 'user',
      entityId: userId,
      metadata: updateData,
    });

    return user;
  }

  async updateAvatar(userId, avatarUrl) {
    const user = await userRepository.update(userId, { avatar_url: avatarUrl });
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async _generateTokens(user, meta = {}) {
    const payload = { sub: user.id, email: user.email, name: user.name };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + parseExpiresIn(config.jwt.refreshExpiresIn));

    const stored = await refreshTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
      userAgent: meta.userAgent,
      ipAddress: meta.ip,
    });

    return { accessToken, refreshToken, tokenId: stored.id };
  }
}

export default new AuthService();
