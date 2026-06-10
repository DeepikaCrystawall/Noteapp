import { Op } from 'sequelize';
import { models } from '../config/database.js';
import { toPlain } from '../utils/modelHelper.js';

const { User } = models;

class UserRepository {
  async findById(id) {
    const user = await User.findOne({
      where: { id },
      attributes: ['id', 'name', 'email', 'avatar_url', 'email_verified', 'last_login_at', 'created_at', 'updated_at'],
    });
    return toPlain(user);
  }

  async findByEmail(email) {
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    return toPlain(user);
  }

  async create({ name, email, passwordHash }) {
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
    });
    return toPlain(user);
  }

  async update(id, data) {
    const user = await User.findByPk(id);
    if (!user) return null;

    await user.update(data);
    return toPlain(user);
  }

  async updatePassword(id, passwordHash) {
    await User.update({ password_hash: passwordHash }, { where: { id } });
  }

  async setResetToken(id, token, expiresAt) {
    await User.update({ reset_token: token, reset_token_expires_at: expiresAt }, { where: { id } });
  }

  async findByResetToken(token) {
    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expires_at: { [Op.gt]: new Date() },
      },
    });
    return toPlain(user);
  }

  async clearResetToken(id) {
    await User.update({ reset_token: null, reset_token_expires_at: null }, { where: { id } });
  }

  async updateLastLogin(id) {
    await User.update({ last_login_at: new Date() }, { where: { id } });
  }

  async softDelete(id) {
    await User.destroy({ where: { id } });
  }
}

export default new UserRepository();
