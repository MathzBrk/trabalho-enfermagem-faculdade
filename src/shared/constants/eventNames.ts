/**
 * Event Names - Centralized event type constants
 *
 * Defines all event types used in the notification system.
 * Using constants prevents typos and enables IDE autocomplete.
 *
 * Naming Convention:
 * - Use dot notation for namespacing (e.g., 'vaccine.scheduled')
 * - Past tense for completed actions (e.g., 'scheduled', not 'schedule')
 * - Descriptive and specific (e.g., 'batch.expiring' not 'batch.warning')
 *
 * Usage:
 * @example
 * // Emitting events
 * eventBus.emit(EventNames.VACCINE_SCHEDULED, payload);
 *
 * // Subscribing to events
 * eventBus.on(EventNames.VACCINE_SCHEDULED, handler);
 *
 * // Type-safe event names
 * const eventName: EventName = EventNames.NURSE_CHANGED;
 */

export const EventNames = {
  // ============================================
  // Vaccine Events
  // ============================================

  /**
   * Emitted when a vaccine is scheduled for a patient
   * Triggers: In-app notification + email to patient and nurse
   */
  VACCINE_SCHEDULED: 'vaccine.scheduled',

  /**
   * Emitted when a nurse is reassigned to a scheduling
   * Triggers: In-app notification + email to patient, old nurse, and new nurse
   */
  NURSE_CHANGED: 'nurse.changed',

  /**
   * Emitted when a vaccine is applied/administered
   * Triggers: In-app notification + confirmation email to patient
   * Note: Handler not yet implemented
   */
  VACCINE_APPLIED: 'vaccine.applied',

  // ============================================
  // Batch & Inventory Events
  // ============================================

  /**
   * Emitted when a vaccine batch is approaching expiration
   * Triggers: In-app notification + email to all managers
   * Threshold: Configurable via BATCH_EXPIRING_DAYS_THRESHOLD (default: 30 days)
   */
  BATCH_EXPIRING: 'batch.expiring',

  /**
   * Emitted when vaccine stock falls below minimum level
   * Triggers: In-app notification + email to all managers
   */
  LOW_STOCK: 'stock.low',

  // ============================================
  // Report Events
  // ============================================

  /**
   * Emitted when a report generation is complete
   * Triggers: In-app notification + email to report requester with download link
   */
  REPORT_GENERATED: 'report.generated',
} as const;

/**
 * Type-safe event name type
 *
 * Ensures only valid event names from EventNames can be used.
 *
 * @example
 * const validEventName: EventName = 'vaccine.scheduled'; // OK
 * const invalidEventName: EventName = 'invalid.event'; // TypeScript error
 */
export type EventName = (typeof EventNames)[keyof typeof EventNames];
