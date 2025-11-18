/**
 * Notification Models - DTOs, Types, and Interfaces
 *
 * Defines the data structures for the notification system.
 * Follows the same pattern as other models in the project (user, vaccine, etc.)
 */

import type {
  NotificationType,
  Prisma,
  Notification as PrismaNotification,
} from '@infrastructure/database/generated/prisma';

// ============================================
// Type Aliases from Prisma
// ============================================

/**
 * Notification entity from database
 */
export type Notification = PrismaNotification;

/**
 * Re-export NotificationType enum from Prisma
 * Values: DOSE_REMINDER, VACCINE_EXPIRING, LOW_STOCK, SCHEDULING_CONFIRMED, GENERAL
 */
export type { NotificationType };

/**
 * Prisma delegate type for Notification model
 * Used by BaseStore pattern
 */
export type NotificationDelegate = Prisma.NotificationDelegate;

// ============================================
// DTOs (Data Transfer Objects) - API Layer
// ============================================

/**
 * DTO for creating a notification via API
 *
 * This is what controllers/services use when creating notifications.
 * Does not include auto-generated fields (id, createdAt, etc.)
 */
export interface CreateNotificationDTO {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
}

/**
 * DTO for updating a notification via API
 *
 * Currently supports marking as read. Can be extended for other updates.
 */
export interface UpdateNotificationDTO {
  isRead?: boolean;
}

/**
 * Filter parameters for querying notifications
 *
 * Used in findByUserId and findPaginated methods
 */
export interface NotificationFilterParams {
  isRead?: boolean;
  type?: NotificationType;
}

// ============================================
// Store Input Types (Database Layer)
// ============================================

/**
 * Input for creating a notification in the database
 *
 * Maps to Prisma's NotificationCreateInput
 */
export interface NotificationCreateInput {
  userId: string;
  type: NotificationTypes;
  title: string;
  message: string;
  metadata?: any; // JSON field for event-specific data (schedulingId, vaccineId, etc.)
  isRead?: boolean; // Defaults to false in Prisma schema
}

/**
 * Input for updating a notification in the database
 *
 * Maps to Prisma's NotificationUpdateInput
 */
export interface NotificationUpdateInput {
  isRead?: boolean;
  readAt?: Date | null;
}

export type NotificationTypes =
  | 'DOSE_REMINDER'
  | 'VACCINE_EXPIRING'
  | 'LOW_STOCK'
  | 'SCHEDULING_CONFIRMED'
  | 'GENERAL'
  | 'VACCINE_APPLIED';

// ============================================
// Response Types
// ============================================

/**
 * Notification response for API
 *
 * Currently identical to Notification entity, but having a separate type
 * allows future transformations (e.g., adding computed fields, formatting dates)
 */
export type NotificationResponse = Notification;
