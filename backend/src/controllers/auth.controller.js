import authService from '../services/auth.service.js';
import { successResponse } from '../utils/response.js';
import { sanitizeIp } from '../utils/ip.js';
import config from '../config/index.js';

const getMeta = (req) => ({
  ip: sanitizeIp(req.ip),
  userAgent: req.get('user-agent'),
});

const setTokenCookies = (res, { accessToken, refreshToken }) => {
  const cookieOptions = {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: 'strict',
    domain: config.cookie.domain,
  };

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

const clearTokenCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body, getMeta(req));
      setTokenCookies(res, result);
      const { password_hash, reset_token, reset_token_expires_at, ...user } = result.user;
      successResponse(res, { user, accessToken: result.accessToken }, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body, getMeta(req));
      setTokenCookies(res, result);
      const { password_hash, ...user } = result.user;
      successResponse(res, { user, accessToken: result.accessToken }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      await authService.logout(refreshToken, req.user?.id);
      clearTokenCookies(res);
      successResponse(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      const result = await authService.refreshTokens(refreshToken, getMeta(req));
      setTokenCookies(res, result);
      successResponse(res, { user: result.user, accessToken: result.accessToken }, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      successResponse(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      await authService.resetPassword(req.body);
      successResponse(res, null, 'Password reset successful');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      await authService.changePassword(req.user.id, req.body);
      successResponse(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      successResponse(res, user);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await authService.updateProfile(req.user.id, req.body);
      successResponse(res, user, 'Profile updated');
    } catch (error) {
      next(error);
    }
  }

  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      const user = await authService.updateAvatar(req.user.id, avatarUrl);
      successResponse(res, user, 'Avatar updated');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
