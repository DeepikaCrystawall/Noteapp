import { Op } from 'sequelize';
import { models } from '../config/database.js';
import { toPlain } from '../utils/modelHelper.js';

const { RefreshToken } = models;

class RefreshTokenRepository {
  async create({ userId, tokenHash, expiresAt, userAgent, ipAddress }) {
    const token = await RefreshToken.create({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      user_agent: userAgent,
      ip_address: ipAddress,
    });
    return toPlain(token);
  }

  async findByHash(tokenHash) {
    const token = await RefreshToken.findOne({
      where: {
        token_hash: tokenHash,
        revoked_at: null,
        expires_at: { [Op.gt]: new Date() },
      },
    });
    return toPlain(token);
  }

  async revoke(id, replacedBy = null) {
    await RefreshToken.update(
      { revoked_at: new Date(), replaced_by: replacedBy },
      { where: { id } }
    );
  }

  async revokeAllForUser(userId) {
    await RefreshToken.update(
      { revoked_at: new Date() },
      { where: { user_id: userId, revoked_at: null } }
    );
  }
}

export default new RefreshTokenRepository();
