/**
 * Notification Event System - Base Types
 *
 * Defines the core event structure for the notification system.
 * All events in the system extend NotificationEvent<T> for type safety.
 *
 * Design Philosophy:
 * - Multi-channel support: Events can trigger in-app, email, SMS, push simultaneously
 * - Priority levels: Support urgent notifications vs normal ones
 * - Metadata: Track event source, timing, and context
 * - Generic payload: Type-safe event data using TypeScript generics
 *
 * Evolution Support:
 * - Works with EventEmitter (synchronous, in-memory)
 * - Works with BullMQ (async, Redis queue, priority support)
 * - Works with RabbitMQ (async, distributed, routing)
 */

/**
 * Notification channels
 *
 * Determines where/how a notification should be delivered.
 * Handlers filter events based on their channel support.
 *
 * Channels:
 * - 'in-app': Save to database, show in UI
 * - 'email': Send via email service (Resend, SendGrid, SES)
 * - 'push': Send push notification (Firebase, OneSignal)
 * - 'sms': Send SMS (Twilio, AWS SNS)
 *
 * @example
 * channels: ['in-app']              // Only in-app notification
 * channels: ['in-app', 'email']     // Both in-app and email
 * channels: ['email', 'sms']        // Email + SMS, no in-app
 */
export type NotificationChannel = 'in-app' | 'email' | 'push' | 'sms';

/**
 * Notification priority levels
 *
 * Used for:
 * - BullMQ job prioritization (higher priority processed first)
 * - UI rendering (urgent notifications shown prominently)
 * - Rate limiting (urgent notifications bypass throttling)
 *
 * Levels:
 * - 'low': Promotional, non-critical updates
 * - 'normal': Standard notifications (default)
 * - 'high': Important but not urgent (batch expiring in 30 days)
 * - 'urgent': Immediate attention required (batch expiring tomorrow)
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Base notification event structure
 *
 * All events in the system follow this structure for consistency.
 * The generic T parameter provides type-safe event-specific data.
 *
 * @template T - Event-specific data type (e.g., VaccineScheduledEventData)
 *
 * @example
 * const event: NotificationEvent<VaccineScheduledEventData> = {
 *   type: 'vaccine.scheduled',
 *   channels: ['in-app', 'email'],
 *   data: {
 *     userId: '123',
 *     vaccineName: 'COVID-19',
 *     scheduledDate: new Date()
 *   },
 *   priority: 'normal',
 *   metadata: {
 *     timestamp: new Date(),
 *     triggeredBy: 'system'
 *   }
 * };
 */
export interface NotificationEvent<T> {
  /**
   * Event type identifier
   *
   * Should use dot notation for namespacing (e.g., 'vaccine.scheduled')
   * See EventNames constants for available types
   */
  type: string;

  /**
   * Channels where this notification should be delivered
   *
   * Handlers filter events based on channels they support.
   * Can specify multiple channels to trigger notifications across platforms.
   */
  channels: NotificationChannel[];

  /**
   * Event-specific data
   *
   * This is the payload containing all information needed to:
   * - Create in-app notification
   * - Generate email content
   * - Send push notification
   * - Compose SMS message
   *
   * Must be JSON-serializable for queue compatibility.
   */
  data: T;

  /**
   * Priority level for processing
   *
   * Affects:
   * - Queue processing order (BullMQ)
   * - UI prominence (in-app)
   * - Rate limiting bypass
   *
   * @default 'normal'
   */
  priority?: NotificationPriority;

  /**
   * Event metadata
   *
   * Optional context about the event itself:
   * - When it was triggered
   * - Who/what triggered it
   * - Request ID for tracing
   * - Environment info
   */
  metadata?: {
    timestamp: Date;
    triggeredBy?: string; // User ID or 'system'
    requestId?: string; // For distributed tracing
    source?: string; // Service/module that emitted the event
    [key: string]: unknown; // Allow custom metadata
  };
}
