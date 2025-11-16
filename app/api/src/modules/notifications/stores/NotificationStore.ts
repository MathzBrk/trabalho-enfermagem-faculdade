/**
 * NotificationStore - Prisma-based implementation of INotificationStore
 *
 * Provides CRUD operations for the notifications table using Prisma ORM.
 * Registered as singleton in DI container.
 *
 * Inherits basic CRUD methods from BaseStore:
 * - findById(id)
 * - create(data)
 * - update(id, data)
 * - delete(id)
 * - count(where?)
 *
 * And adds Notification-specific methods:
 * - findByUserId() - Find all notifications for a user with filters
 * - findPaginated() - Paginated notifications with filters
 * - markAsRead() - Mark single notification as read
 * - markAllAsRead() - Bulk mark all as read for a user
 * - countUnread() - Count unread notifications
 * - deleteReadNotifications() - Bulk delete read notifications
 */

import { injectable } from 'tsyringe';
import { BaseStore } from '@shared/stores/baseStore';
import type { INotificationStore } from '@shared/interfaces/notification';
import type {
  Notification,
  NotificationCreateInput,
  NotificationUpdateInput,
  NotificationFilterParams,
  NotificationDelegate,
} from '@shared/models/notification';
import type {
  PaginatedResponse,
  PaginationParams,
} from '@shared/interfaces/pagination';
import { calculatePaginationMetadata } from '@shared/interfaces/pagination';
import { buildPaginationArgs } from '@shared/helpers/prismaHelper';
import type { Prisma } from '@infrastructure/database';
import { getCurrentDate } from '@shared/helpers/timeHelper';

@injectable()
export class NotificationStore
  extends BaseStore<
    Notification,
    NotificationDelegate,
    NotificationCreateInput,
    NotificationUpdateInput
  >
  implements INotificationStore
{
  protected readonly model = this.prisma.notification;

  /**
   * Find all notifications for a specific user with optional filters
   *
   * @param userId - User ID to fetch notifications for
   * @param filters - Optional filters (isRead, type)
   * @returns Array of notifications ordered by createdAt DESC
   */
  async findByUserId(
    userId: string,
    filters?: NotificationFilterParams,
  ): Promise<Notification[]> {
    const where: Prisma.NotificationWhereInput = {
      userId,
    };

    // Apply filters if provided
    if (filters?.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    return this.model.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find paginated notifications for a user
   *
   * @param userId - User ID to fetch notifications for
   * @param params - Pagination parameters (page, perPage)
   * @param filters - Optional filters
   * @returns Paginated notification response
   */
  async findPaginated(
    userId: string,
    params: PaginationParams,
    filters?: NotificationFilterParams,
  ): Promise<PaginatedResponse<Notification>> {
    const where: Prisma.NotificationWhereInput = {
      userId,
    };

    // Apply filters
    if (filters?.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    // Build pagination arguments
    const paginationArgs = buildPaginationArgs(params);

    // Execute query and count in parallel
    const [data, totalCount] = await Promise.all([
      this.model.findMany({
        where,
        ...paginationArgs,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.model.count({ where }),
    ]);

    // Calculate pagination metadata
    const pagination = calculatePaginationMetadata(
      params.page,
      params.perPage,
      totalCount,
    );

    return {
      data,
      pagination,
    };
  }

  /**
   * Mark a notification as read
   *
   * @param id - Notification ID
   * @returns Updated notification
   */
  async markAsRead(id: string): Promise<Notification> {
    return this.model.update({
      where: { id },
      data: {
        isRead: true,
        readAt: getCurrentDate(),
      },
    });
  }

  /**
   * Mark all notifications as read for a user
   *
   * @param userId - User ID
   * @returns Number of notifications updated
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.model.updateMany({
      where: {
        userId,
        isRead: false, // Only update unread notifications
      },
      data: {
        isRead: true,
        readAt: getCurrentDate(),
      },
    });

    return result.count;
  }

  /**
   * Count unread notifications for a user
   *
   * @param userId - User ID
   * @returns Number of unread notifications
   */
  async countUnread(userId: string): Promise<number> {
    return this.model.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  /**
   * Delete all read notifications for a user
   * Useful for cleanup/housekeeping
   *
   * @param userId - User ID
   * @returns Number of notifications deleted
   */
  async deleteReadNotifications(userId: string): Promise<number> {
    const result = await this.model.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });

    return result.count;
  }
}
