/**
 * Notification Module Contracts
 *
 * Re-exports shared interfaces for convenience.
 * This allows notification module code to import from '@modules/notifications/contracts'
 * instead of reaching into '@shared/interfaces' directly.
 *
 * Benefits:
 * - Cleaner imports within the module
 * - Clear separation of module dependencies
 * - Easy to see all contracts the module depends on
 */

// Event Bus
export type { IEventBus } from '@shared/interfaces/eventBus';

// Notification Store
export type {
  INotificationStore,
  NotificationFilterParams,
} from '@shared/interfaces/notification';

// Re-export event types for convenience
export type {
  NotificationEvent,
  NotificationChannel,
  NotificationPriority,
} from '@shared/models/notificationEvent';

// Re-export all event data types
export type {
  VaccineScheduledEvent,
  VaccineScheduledEventData,
  NurseChangedEvent,
  NurseChangedEventData,
  VaccineAppliedEvent,
  VaccineAppliedEventData,
} from '@shared/models/vaccineNotificationEvents';

export type {
  BatchExpiringEvent,
  BatchExpiringEventData,
  LowStockEvent,
  LowStockEventData,
} from '@shared/models/batchNotificationEvents';

export type {
  ReportGeneratedEvent,
  ReportGeneratedEventData,
} from '@shared/models/reportNotificationEvents';

// Re-export event names
export { EventNames, type EventName } from '@shared/constants/eventNames';
