import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/notifications (NotificationController).
 *
 * userId is passed explicitly because the backend has no session identity yet
 * (docs/BACKEND_GAPS.md #1).
 */
export const notificationApi = {
  /** GET → NotificationResponse[]. */
  list: (userId, { unreadOnly = false, limit = 50 } = {}) =>
    http.get('/v1/notifications', { params: { userId, unreadOnly, limit } }),

  /** GET /unread-count → { unread }. */
  unreadCount: (userId) => http.get('/v1/notifications/unread-count', { params: { userId } }),

  /** PATCH /{id}/read → 204. */
  markRead: (id) => http.patch(`/v1/notifications/${id}/read`),

  /** PATCH /read-all → { updated }. */
  markAllRead: (userId) => http.patch('/v1/notifications/read-all', null, { params: { userId } }),
};
