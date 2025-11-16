import type { Notification } from '../types';
import { mockNotifications } from '../utils/mockData';

/**
 * Notification service
 * Currently using mock data - will integrate with real API later
 */
export const notificationService = {
  /**
   * List notifications for a user
   */
  list: async (userId: string, isRead?: boolean): Promise<Notification[]> => {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        let notifications = mockNotifications.filter((n) => n.userId === userId);

        if (typeof isRead === 'boolean') {
          notifications = notifications.filter((n) => n.isRead === isRead);
        }

        resolve(notifications);
      }, 500);
    });

    // Real API call (commented out for now)
    // const params: { userId: string; isRead?: boolean } = { userId };
    // if (typeof isRead === 'boolean') {
    //   params.isRead = isRead;
    // }
    // const response = await api.get<Notification[]>('/notifications', { params });
    // return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: string): Promise<void> => {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const notification = mockNotifications.find((n) => n.id === notificationId);
        if (notification) {
          notification.isRead = true;
        }
        resolve();
      }, 300);
    });

    // Real API call (commented out for now)
    // await api.patch(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read for a user
   */
  markAllAsRead: async (userId: string): Promise<void> => {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        mockNotifications.forEach((notification) => {
          if (notification.userId === userId) {
            notification.isRead = true;
          }
        });
        resolve();
      }, 300);
    });

    // Real API call (commented out for now)
    // await api.patch('/notifications/read-all', { userId });
  },

  /**
   * Get unread count for a user
   */
  getUnreadCount: async (userId: string): Promise<number> => {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const count = mockNotifications.filter(
          (n) => n.userId === userId && !n.isRead
        ).length;
        resolve(count);
      }, 300);
    });

    // Real API call (commented out for now)
    // const response = await api.get<{ count: number }>('/notifications/unread-count', {
    //   params: { userId },
    // });
    // return response.data.count;
  },
};
