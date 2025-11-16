/**
 * NotificationService - Business logic layer for notifications
 *
 * Orchestrates notification operations for API endpoints.
 * Handles business rules, authorization, and data transformation.
 *
 * Business rules:
 * - Users can only access their own notifications
 * - Authorization checks performed before sensitive operations
 *
 * Used by:
 * - NotificationController (REST API endpoints)
 */

import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@infrastructure/di/tokens';
import type { INotificationStore } from '@modules/notifications/contracts';
import type {
  Notification,
  NotificationFilterParams,
} from '@shared/models/notification';
import type {
  PaginatedResponse,
  PaginationParams,
} from '@shared/interfaces/pagination';
import {
  NotificationNotFoundError,
  UnauthorizedNotificationAccessError,
} from '@modules/notifications/errors';

@injectable()
export class NotificationService {
  constructor(
    @inject(TOKENS.INotificationStore)
    private readonly notificationStore: INotificationStore,
  ) {}

  /**
   * Get paginated notifications for a user
   *
   * @param userId - User ID to fetch notifications for
   * @param params - Pagination parameters
   * @param filters - Optional filters (isRead, type)
   * @returns Paginated notification response
   */
  async getNotifications(
    userId: string,
    params: PaginationParams,
    filters?: NotificationFilterParams,
  ): Promise<PaginatedResponse<Notification>> {
    return this.notificationStore.findPaginated(userId, params, filters);
  }

  /**
   * Get count of unread notifications for a user
   *
   * Used for badge counters in UI.
   *
   * @param userId - User ID
   * @returns Number of unread notifications
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationStore.countUnread(userId);
  }

  /**
   * Mark a notification as read
   *
   * Includes authorization check - users can only mark their own notifications as read.
   *
   * @param id - Notification ID
   * @param userId - User ID making the request (for authorization)
   * @returns Updated notification
   * @throws NotificationNotFoundError if notification doesn't exist
   * @throws UnauthorizedNotificationAccessError if notification doesn't belong to user
   */
  async markAsRead(id: string, userId: string): Promise<Notification> {
    // Fetch notification to verify ownership
    const notification = await this.notificationStore.findById(id);

    if (!notification) {
      throw new NotificationNotFoundError(id);
    }

    // Authorization check: notification must belong to requesting user
    if (notification.userId !== userId) {
      throw new UnauthorizedNotificationAccessError(
        'You can only mark your own notifications as read',
      );
    }

    // Mark as read
    return this.notificationStore.markAsRead(id);
  }

  /**
   * Mark all notifications as read for a user
   *
   * @param userId - User ID
   * @returns Number of notifications updated
   */
  async markAllAsRead(userId: string): Promise<number> {
    return this.notificationStore.markAllAsRead(userId);
  }

  /**
   * Delete a notification
   *
   * Includes authorization check - users can only delete their own notifications.
   *
   * @param id - Notification ID
   * @param userId - User ID making the request (for authorization)
   * @returns Deleted notification
   * @throws NotificationNotFoundError if notification doesn't exist
   * @throws UnauthorizedNotificationAccessError if notification doesn't belong to user
   */
  async deleteNotification(id: string, userId: string): Promise<Notification> {
    // Fetch notification to verify ownership
    const notification = await this.notificationStore.findById(id);

    if (!notification) {
      throw new NotificationNotFoundError(id);
    }

    // Authorization check: notification must belong to requesting user
    if (notification.userId !== userId) {
      throw new UnauthorizedNotificationAccessError(
        'You can only delete your own notifications',
      );
    }

    // Delete
    return this.notificationStore.delete(id);
  }

  /**
   * Clear all read notifications for a user
   *
   * Useful for "Clear all" buttons in UI.
   * Only deletes notifications that are already marked as read.
   *
   * @param userId - User ID
   * @returns Number of notifications deleted
   */
  async clearReadNotifications(userId: string): Promise<number> {
    return this.notificationStore.deleteReadNotifications(userId);
  }
}
