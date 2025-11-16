/**
 * INotificationStore - Notification Persistence Interface
 *
 * Data access layer for the notifications table.
 * Provides CRUD operations following the same pattern as other stores in the project.
 *
 * Responsibilities:
 * - Create, read, update, delete notifications
 * - Query notifications by user with filters
 * - Mark notifications as read (single or bulk)
 * - Count unread notifications
 *
 * Note: This interface is intentionally simple and focused on data access.
 * Business logic (which notifications to create, when to send them) belongs
 * in services and handlers, not in the store.
 */

import type {
  PaginatedResponse,
  PaginationParams,
} from '@shared/interfaces/pagination';
import type {
  Notification,
  NotificationCreateInput,
  NotificationUpdateInput,
  NotificationFilterParams,
} from '@shared/models/notification';

export interface INotificationStore {
  /**
   * Create a new notification
   *
   * @param data - Notification creation data
   * @returns Created notification
   */
  create(data: NotificationCreateInput): Promise<Notification>;

  /**
   * Find a notification by ID
   *
   * @param id - Notification ID
   * @returns Notification or null if not found
   */
  findById(id: string): Promise<Notification | null>;

  /**
   * Find notifications for a specific user with optional filters
   *
   * @param userId - User ID to fetch notifications for
   * @param filters - Optional filters (isRead, type, etc.)
   * @returns Array of notifications
   */
  findByUserId(
    userId: string,
    filters?: NotificationFilterParams,
  ): Promise<Notification[]>;

  /**
   * Find paginated notifications for a user
   *
   * @param userId - User ID to fetch notifications for
   * @param params - Pagination parameters (page, perPage)
   * @param filters - Optional filters
   * @returns Paginated notification response
   */
  findPaginated(
    userId: string,
    params: PaginationParams,
    filters?: NotificationFilterParams,
  ): Promise<PaginatedResponse<Notification>>;

  /**
   * Mark a notification as read
   *
   * @param id - Notification ID
   * @returns Updated notification
   */
  markAsRead(id: string): Promise<Notification>;

  /**
   * Mark all notifications as read for a user
   *
   * @param userId - User ID
   * @returns Number of notifications updated
   */
  markAllAsRead(userId: string): Promise<number>;

  /**
   * Count unread notifications for a user
   *
   * @param userId - User ID
   * @returns Number of unread notifications
   */
  countUnread(userId: string): Promise<number>;

  /**
   * Update a notification
   *
   * @param id - Notification ID
   * @param data - Update data
   * @returns Updated notification
   */
  update(id: string, data: NotificationUpdateInput): Promise<Notification>;

  /**
   * Delete a notification (hard delete)
   *
   * @param id - Notification ID
   * @returns Deleted notification
   */
  delete(id: string): Promise<Notification>;

  /**
   * Delete all read notifications for a user
   * Useful for cleanup/housekeeping
   *
   * @param userId - User ID
   * @returns Number of notifications deleted
   */
  deleteReadNotifications(userId: string): Promise<number>;
}

export type { NotificationFilterParams };
