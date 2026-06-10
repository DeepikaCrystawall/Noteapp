import notificationRepository from '../repositories/notification.repository.js';
import { cacheDelete, CACHE_KEYS } from '../utils/cache.js';
import redis, { redisPub } from '../config/redis.js';
import { PUBSUB_CHANNELS } from '../events/channels.js';

class NotificationService {
  async create({ userId, type, title, message, data = {} }) {
    const notification = await notificationRepository.create({ userId, type, title, message, data });

    await cacheDelete(CACHE_KEYS.notifications(userId));
    await cacheDelete(CACHE_KEYS.unreadCount(userId));
    await redis.incr(CACHE_KEYS.unreadCount(userId));

    await redisPub.publish(
      PUBSUB_CHANNELS.NOTIFICATION,
      JSON.stringify({ userId, notification })
    );

    return notification;
  }

  async getNotifications(userId, options) {
    const cached = await redis.get(CACHE_KEYS.notifications(userId));
    if (cached && !options.unreadOnly) {
      return JSON.parse(cached);
    }

    const result = await notificationRepository.findByUser(userId, options);
    if (!options.unreadOnly) {
      await redis.setex(CACHE_KEYS.notifications(userId), 300, JSON.stringify(result));
    }

    const unreadCached = await redis.get(CACHE_KEYS.unreadCount(userId));
    if (unreadCached !== null) {
      result.unreadCount = parseInt(unreadCached, 10);
    }

    return result;
  }

  async getUnreadCount(userId) {
    const cached = await redis.get(CACHE_KEYS.unreadCount(userId));
    if (cached !== null) return parseInt(cached, 10);

    const result = await notificationRepository.findByUser(userId, { unreadOnly: true, limit: 1 });
    await redis.setex(CACHE_KEYS.unreadCount(userId), 300, String(result.unreadCount));
    return result.unreadCount;
  }

  async markAsRead(id, userId) {
    const notification = await notificationRepository.markAsRead(id, userId);
    if (notification) {
      await cacheDelete(CACHE_KEYS.notifications(userId));
      await redis.decr(CACHE_KEYS.unreadCount(userId));
    }
    return notification;
  }

  async markAllAsRead(userId) {
    await notificationRepository.markAllAsRead(userId);
    await cacheDelete(CACHE_KEYS.notifications(userId));
    await redis.set(CACHE_KEYS.unreadCount(userId), '0');
  }
}

export default new NotificationService();
