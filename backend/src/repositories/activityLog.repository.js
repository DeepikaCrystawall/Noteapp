import { models } from '../config/database.js';
import { toPlain } from '../utils/modelHelper.js';

const { ActivityLog, User } = models;

class ActivityLogRepository {
  async create({ userId, action, entityType, entityId, metadata = {}, ipAddress, userAgent }) {
    const log = await ActivityLog.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
    return toPlain(log);
  }

  async findByUser(userId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const { rows, count } = await ActivityLog.findAndCountAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
    return { logs: toPlain(rows), total: count, page, limit };
  }

  async findByEntity(entityType, entityId, { limit = 50 } = {}) {
    const logs = await ActivityLog.findAll({
      where: { entity_type: entityType, entity_id: entityId },
      include: [{ model: User, as: 'user', attributes: ['name'] }],
      order: [['created_at', 'DESC']],
      limit,
    });
    return logs.map((log) => {
      const plain = toPlain(log);
      plain.user_name = log.user?.name;
      return plain;
    });
  }
}

export default new ActivityLogRepository();
