import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub, email: decoded.email, name: decoded.name };
    next();
  } catch (error) {
    next(error instanceof UnauthorizedError ? error : new UnauthorizedError('Invalid access token'));
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.accessToken;
    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = { id: decoded.sub, email: decoded.email, name: decoded.name };
    }
    next();
  } catch {
    next();
  }
};
