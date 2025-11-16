/**
 * DI Tokens
 *
 * Symbol-based tokens for dependency injection using TSyringe.
 * Using Symbol.for() ensures tokens are globally unique and can be
 * referenced across different modules.
 *
 * Benefits of Symbol-based tokens:
 * - Type-safe: TypeScript can infer the type from the interface
 * - No string collisions: Symbols are guaranteed unique
 * - Clear naming: Tokens match interface names
 * - Refactor-safe: Can rename implementations without breaking DI
 */

export const TOKENS = {
  /**
   * Token for IUserStore interface
   *
   * Implementations:
   * - UserStore (Prisma-based, production)
   * - MockUserStore (in-memory, testing/development)
   */
  IUserStore: Symbol.for('IUserStore'),
  IVaccineStore: Symbol.for('IVaccineStore'),
  IVaccineBatchStore: Symbol.for('IVaccineBatchStore'),
  IVaccineApplicationStore: Symbol.for('IVaccineApplicationStore'),
  IVaccineSchedulingStore: Symbol.for('IVaccineSchedulingStore'),

  /**
   * Token for UserService
   *
   * Service layer for user business logic and operations.
   * This service provides a facade over IUserStore with additional
   * business rules, validation, and authorization logic.
   *
   * Other services should depend on UserService (not IUserStore)
   * to maintain proper encapsulation and respect bounded contexts.
   */
  UserService: Symbol.for('UserService'),
  VaccineBatchService: Symbol.for('VaccineBatchService'),
  VaccineService: Symbol.for('VaccineService'),
  VaccineApplicationService: Symbol.for('VaccineApplicationService'),
  VaccineSchedulingService: Symbol.for('VaccineSchedulingService'),

  // ============================================
  // Notification Module Tokens
  // ============================================

  /**
   * Token for IEventBus interface
   *
   * Implementations:
   * - NodeEventBus (EventEmitter-based, MVP)
   * - BullMQEventBus (Redis queue-based, future production)
   * - RabbitMQEventBus (AMQP-based, future scale)
   *
   * The event bus is the core abstraction for the notification system.
   * Switching implementations requires only changing the DI registration,
   * with zero changes to services or handlers.
   */
  IEventBus: Symbol.for('IEventBus'),

  /**
   * Token for INotificationStore interface
   *
   * Implementations:
   * - NotificationStore (Prisma-based, production)
   *
   * Provides data access for the notifications table.
   */
  INotificationStore: Symbol.for('INotificationStore'),

  /**
   * Token for NotificationService
   *
   * Business logic layer for notification operations.
   * Used by controllers to manage notifications (list, mark as read, delete).
   */
  NotificationService: Symbol.for('NotificationService'),

  /**
   * Token for NotificationBootstrap
   *
   * Initializes the notification system by registering event handlers.
   * Called once during application startup.
   */
  NotificationBootstrap: Symbol.for('NotificationBootstrap'),

  // ============================================
  // Notification Event Handler Tokens
  // ============================================

  /**
   * Vaccine scheduled in-app notification handler
   */
  VaccineScheduledHandler: Symbol.for('VaccineScheduledHandler'),

  /**
   * Nurse changed in-app notification handler
   */
  NurseChangedHandler: Symbol.for('NurseChangedHandler'),

  /**
   * Batch expiring in-app notification handler
   */
  BatchExpiringHandler: Symbol.for('BatchExpiringHandler'),

  /**
   * Low stock in-app notification handler
   */
  LowStockHandler: Symbol.for('LowStockHandler'),

  /**
   * Report generated in-app notification handler
   */
  ReportGeneratedHandler: Symbol.for('ReportGeneratedHandler'),
} as const;
