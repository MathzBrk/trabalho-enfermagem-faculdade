/**
 * NotificationBootstrap - Event handler registration
 *
 * Initializes the notification system by registering all event handlers
 * with the event bus. Called once during application startup.
 *
 * Registered handlers:
 * - VaccineScheduledHandler → 'vaccine.scheduled'
 * - NurseChangedHandler → 'nurse.changed'
 * - BatchExpiringHandler → 'batch.expiring'
 * - LowStockHandler → 'stock.low'
 * - ReportGeneratedHandler → 'report.generated'
 *
 * Usage:
 * After DI container is configured, call:
 * ```typescript
 * const bootstrap = container.resolve(TOKENS.NotificationBootstrap);
 * bootstrap.initialize();
 * ```
 */

import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@infrastructure/di/tokens';
import type { IEventBus } from '@modules/notifications/contracts';
import { EventNames } from '@modules/notifications/contracts';
import type { InAppVaccineScheduledHandler } from '../handlers/InAppVaccineScheduledHandler';
import type { InAppNurseChangedHandler } from '../handlers/InAppNurseChangedHandler';
import type { InAppBatchExpiringHandler } from '../handlers/InAppBatchExpiringHandler';
import type { InAppLowStockHandler } from '../handlers/InAppLowStockHandler';
import type { InAppReportGeneratedHandler } from '../handlers/InAppReportGeneratedHandler';

@injectable()
export class NotificationBootstrap {
  constructor(
    @inject(TOKENS.IEventBus)
    private readonly eventBus: IEventBus,
    @inject(TOKENS.VaccineScheduledHandler)
    private readonly vaccineScheduledHandler: InAppVaccineScheduledHandler,
    @inject(TOKENS.NurseChangedHandler)
    private readonly nurseChangedHandler: InAppNurseChangedHandler,
    @inject(TOKENS.BatchExpiringHandler)
    private readonly batchExpiringHandler: InAppBatchExpiringHandler,
    @inject(TOKENS.LowStockHandler)
    private readonly lowStockHandler: InAppLowStockHandler,
    @inject(TOKENS.ReportGeneratedHandler)
    private readonly reportGeneratedHandler: InAppReportGeneratedHandler,
  ) {}

  /**
   * Initialize notification system
   *
   * Registers all event handlers with the event bus.
   * Should be called once during application startup (in setupContainer).
   *
   * IMPORTANT: Handler methods are bound to preserve 'this' context.
   */
  initialize(): void {
    console.log('[NotificationBootstrap] Initializing notification system...');

    // Register vaccine scheduling events
    this.eventBus.on(
      EventNames.VACCINE_SCHEDULED,
      this.vaccineScheduledHandler.handle.bind(this.vaccineScheduledHandler),
    );

    this.eventBus.on(
      EventNames.NURSE_CHANGED,
      this.nurseChangedHandler.handle.bind(this.nurseChangedHandler),
    );

    // Register batch/inventory events
    this.eventBus.on(
      EventNames.BATCH_EXPIRING,
      this.batchExpiringHandler.handle.bind(this.batchExpiringHandler),
    );

    this.eventBus.on(
      EventNames.LOW_STOCK,
      this.lowStockHandler.handle.bind(this.lowStockHandler),
    );

    // Register report events
    this.eventBus.on(
      EventNames.REPORT_GENERATED,
      this.reportGeneratedHandler.handle.bind(this.reportGeneratedHandler),
    );

    console.log(
      '[NotificationBootstrap] Notification system initialized successfully.',
    );
    console.log(
      '[NotificationBootstrap] Registered events:',
      Object.values(EventNames),
    );
  }
}
