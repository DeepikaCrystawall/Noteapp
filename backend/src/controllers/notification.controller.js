import notificationService from '../services/notification.service.js';
import { successResponse, paginatedResponse } from '../utils/response.js';

class NotificationController {
  async list(req, res, next) {
    try {
      const result = await notificationService.getNotifications(req.user.id, req.query);
      paginatedResponse(res, result.notifications, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        unreadCount: result.unreadCount,
      });
    } catch (error) {
      next(error);
    }
  }

  async unreadCount(req, res, next) {
    try {
      const count = await notificationService.getUnreadCount(req.user.id);
      successResponse(res, { count });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user.id);
      successResponse(res, notification, 'Marked as read');
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user.id);
      successResponse(res, null, 'All marked as read');
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
