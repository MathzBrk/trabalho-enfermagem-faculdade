/**
 * NotificationController - HTTP request handler for notification endpoints
 *
 * Handles REST API requests for notification management.
 * Delegates business logic to NotificationService.
 *
 * Endpoints:
 * - GET /notifications - List notifications with pagination and filters
 * - PATCH /notifications/:id/read - Mark a notification as read
 * - PATCH /notifications/read-all - Mark all notifications as read
 *
 * All endpoints require authentication via authMiddleware.
 * Authorization is enforced in the service layer.
 */

import { injectable } from 'tsyringe';
import type { Request, Response, NextFunction } from 'express';
import { NotificationService } from '@modules/notifications/services/NotificationService';
import type { ListNotificationsQuery } from '@modules/notifications/validators/listNotificationsValidator';
import type { NotificationIdParam } from '@modules/notifications/validators/idParamValidator';

@injectable()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * List all notifications for the authenticated user
   *
   * Supports pagination (page, perPage) and optional filters (isRead, type).
   * Users can only see their own notifications.
   *
   * @route GET /notifications
   * @authentication Required (authMiddleware)
   * @param req.user.userId - Authenticated user ID (set by authMiddleware)
   * @param req.query - Pagination and filter parameters
   * @returns 200 with paginated notifications
   */
  listNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { page, perPage, isRead, type } =
        req.query as unknown as ListNotificationsQuery;

      const paginationParams = { page, perPage };
      const filters = { isRead, type };

      const result = await this.notificationService.getNotifications(
        userId,
        paginationParams,
        filters,
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark a specific notification as read
   *
   * Updates the notification's isRead flag to true and sets readAt timestamp.
   * Users can only mark their own notifications as read.
   *
   * @route PATCH /notifications/:id/read
   * @authentication Required (authMiddleware)
   * @param req.params.id - Notification ID (UUID)
   * @param req.user.userId - Authenticated user ID
   * @returns 200 with updated notification
   * @throws 404 NotificationNotFoundError if notification doesn't exist
   * @throws 403 UnauthorizedNotificationAccessError if notification doesn't belong to user
   */
  markAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params as unknown as NotificationIdParam;

      const notification = await this.notificationService.markAsRead(
        id,
        userId,
      );

      res.status(200).json(notification);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark all notifications as read for the authenticated user
   *
   * Bulk operation that updates all unread notifications to read.
   * Returns the count of notifications updated.
   *
   * @route PATCH /notifications/read-all
   * @authentication Required (authMiddleware)
   * @param req.user.userId - Authenticated user ID
   * @returns 200 with count of updated notifications
   */
  markAllAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;

      const count = await this.notificationService.markAllAsRead(userId);

      res.status(200).json({ count });
    } catch (error) {
      next(error);
    }
  };
}
