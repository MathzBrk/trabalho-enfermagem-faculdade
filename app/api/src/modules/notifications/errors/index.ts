/**
 * Notification Errors - Custom error classes
 *
 * Defines domain-specific errors for the notification module.
 * All errors extend a base AppError class with HTTP status codes.
 */

/**
 * Base application error
 * All custom errors in the application extend this class
 */
class AppError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Generic notification error
 *
 * Used for general notification system failures that don't fit
 * more specific error categories.
 *
 * @example
 * throw new NotificationError('Failed to process notification');
 */
export class NotificationError extends AppError {
  constructor(message = 'Notification error occurred') {
    super(message, 500);
  }
}

/**
 * Notification not found error
 *
 * Thrown when attempting to access a notification that doesn't exist
 * or when a user tries to access a notification that doesn't belong to them.
 *
 * @example
 * if (!notification) {
 *   throw new NotificationNotFoundError('Notification with ID 123 not found');
 * }
 */
export class NotificationNotFoundError extends AppError {
  constructor(message = 'Notification not found') {
    super(message, 404);
  }
}

/**
 * Unauthorized notification access error
 *
 * Thrown when a user attempts to access or modify a notification
 * that doesn't belong to them.
 *
 * @example
 * if (notification.userId !== requestingUserId) {
 *   throw new UnauthorizedNotificationAccessError();
 * }
 */
export class UnauthorizedNotificationAccessError extends AppError {
  constructor(
    message = 'You do not have permission to access this notification',
  ) {
    super(message, 403);
  }
}

/**
 * Event handler error
 *
 * Thrown (and caught) when an event handler fails to process an event.
 * This is typically logged but doesn't crash the application, as event
 * handling is designed to be non-blocking.
 *
 * @example
 * try {
 *   await handler.handle(event);
 * } catch (error) {
 *   throw new EventHandlerError('vaccine.scheduled', error);
 * }
 */
export class EventHandlerError extends AppError {
  constructor(eventName: string, cause?: Error) {
    super(
      `Error handling event "${eventName}": ${cause?.message || 'Unknown error'}`,
      500,
    );
    this.name = 'EventHandlerError';
  }
}
