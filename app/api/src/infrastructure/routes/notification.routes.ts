import { Router } from 'express';
import { NotificationController } from '@modules/notifications/controllers/NotificationController';
import { container } from '@infrastructure/di/container';
import { authMiddleware } from '@shared/middlewares/authMiddleware';
import { validateRequest } from '@shared/middlewares/validateRequest';
import { ListNotificationsQuerySchema } from '@modules/notifications/validators/listNotificationsValidator';
import { NotificationIdParamSchema } from '@modules/notifications/validators/idParamValidator';

/**
 * Notification Routes
 *
 * Defines all HTTP endpoints for notification-related operations.
 * Controller is resolved from DI container to ensure all dependencies
 * are properly injected.
 */
const notificationRoutes = Router();

// Resolve NotificationController from DI container
const notificationController = container.resolve(NotificationController);

/**
 * GET /notifications
 * List all notifications for the authenticated user
 *
 * Authentication: Required (JWT token via authMiddleware)
 * Authorization: Users can only see their own notifications
 *
 * Query Parameters:
 * - page: number (default: 1) - Page number (1-indexed)
 * - perPage: number (default: 10, max: 100) - Items per page
 * - isRead: boolean (optional) - Filter by read status
 * - type: string (optional) - Filter by notification type
 *
 * Valid notification types:
 * - SCHEDULING_CONFIRMED
 * - SCHEDULING_CANCELLED
 * - SCHEDULING_REMINDER
 * - VACCINE_DOSE_DUE
 * - SYSTEM_ANNOUNCEMENT
 *
 * Example:
 * GET /api/notifications?page=1&perPage=20&isRead=false
 * Authorization: Bearer <JWT_TOKEN>
 *
 * Response: 200 OK
 * {
 *   "data": [
 *     {
 *       "id": "uuid",
 *       "type": "SCHEDULING_CONFIRMED",
 *       "title": "Vaccine Scheduled",
 *       "message": "Your vaccine has been scheduled for...",
 *       "isRead": false,
 *       "readAt": null,
 *       "metadata": { "schedulingId": "uuid" },
 *       "userId": "uuid",
 *       "createdAt": "2025-11-16T00:00:00.000Z"
 *     }
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "perPage": 20,
 *     "total": 45,
 *     "totalPages": 3,
 *     "hasNext": true,
 *     "hasPrev": false
 *   }
 * }
 *
 * Middleware Chain:
 * 1. authMiddleware - Verifies JWT token, sets req.user
 * 2. validateRequest - Validates query params with Zod schema
 * 3. notificationController.listNotifications - Handles business logic
 */
notificationRoutes.get(
  '/',
  authMiddleware,
  validateRequest({ query: ListNotificationsQuerySchema }),
  notificationController.listNotifications.bind(notificationController),
);

/**
 * PATCH /notifications/:id/read
 * Mark a specific notification as read
 *
 * Authentication: Required (JWT token via authMiddleware)
 * Authorization: Users can only mark their own notifications as read
 *
 * Path Parameters:
 * - id: string (UUID) - Notification ID
 *
 * Example:
 * PATCH /api/notifications/550e8400-e29b-41d4-a716-446655440000/read
 * Authorization: Bearer <JWT_TOKEN>
 *
 * Response: 200 OK
 * {
 *   "id": "550e8400-e29b-41d4-a716-446655440000",
 *   "type": "SCHEDULING_CONFIRMED",
 *   "title": "Vaccine Scheduled",
 *   "message": "Your vaccine has been scheduled for...",
 *   "isRead": true,
 *   "readAt": "2025-11-16T10:30:00.000Z",
 *   "metadata": { "schedulingId": "uuid" },
 *   "userId": "uuid",
 *   "createdAt": "2025-11-15T00:00:00.000Z"
 * }
 *
 * Errors:
 * - 401 Unauthorized: No authentication token
 * - 403 Forbidden: Notification doesn't belong to authenticated user
 * - 404 Not Found: Notification not found
 *
 * Middleware Chain:
 * 1. authMiddleware - Verifies JWT token, sets req.user
 * 2. validateRequest - Validates params with Zod schema
 * 3. notificationController.markAsRead - Handles business logic
 */
notificationRoutes.patch(
  '/:id/read',
  authMiddleware,
  validateRequest({ params: NotificationIdParamSchema }),
  notificationController.markAsRead.bind(notificationController),
);

/**
 * PATCH /notifications/read-all
 * Mark all notifications as read for the authenticated user
 *
 * Authentication: Required (JWT token via authMiddleware)
 * Authorization: Users can only mark their own notifications as read
 *
 * Business Rules:
 * - Updates all unread notifications for the user
 * - Sets isRead=true and readAt=current timestamp
 * - Idempotent operation (safe to call multiple times)
 *
 * Example:
 * PATCH /api/notifications/read-all
 * Authorization: Bearer <JWT_TOKEN>
 *
 * Response: 200 OK
 * {
 *   "count": 12
 * }
 *
 * Errors:
 * - 401 Unauthorized: No authentication token
 *
 * Middleware Chain:
 * 1. authMiddleware - Verifies JWT token, sets req.user
 * 2. notificationController.markAllAsRead - Handles business logic
 */
notificationRoutes.patch(
  '/read-all',
  authMiddleware,
  notificationController.markAllAsRead.bind(notificationController),
);

export default notificationRoutes;
