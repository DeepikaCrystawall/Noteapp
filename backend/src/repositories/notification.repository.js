import { models } from '../config/database.js';
import { toPlain } from '../utils/modelHelper.js';

const { Notification } = models;

class NotificationRepository {
  async create({ userId, type, title, message, data = {} }) {
    const notification = await Notification.create({
      user_id: userId,
      type,
      title,
      message,
      data,
    });
    return toPlain(notification);
  }

  async findByUser(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    const offset = (page - 1) * limit;
    const where = { user_id: userId };
    if (unreadOnly) where.is_read = false;

    const [rows, total, unreadCount] = await Promise.all([
      Notification.findAll({
        where,
        order: [['created_at', 'DESC']],
        limit,
        offset,
      }),
      Notification.count({ where }),
      Notification.count({ where: { user_id: userId, is_read: false } }),
    ]);

    return {
      notifications: toPlain(rows),
      total,
      unreadCount,
      page,
      limit,
    };
  }

  async markAsRead(id, userId) {
    const notification = await Notification.findOne({ where: { id, user_id: userId } });
    if (!notification) return null;
    await notification.update({ is_read: true, read_at: new Date() });
    return toPlain(notification);
  }

  async markAllAsRead(userId) {
    await Notification.update(
      { is_read: true, read_at: new Date() },
      { where: { user_id: userId, is_read: false } }
    );
  }
}

export default new NotificationRepository();
