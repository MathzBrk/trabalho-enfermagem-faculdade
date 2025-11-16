/**
 * InAppVaccineScheduledHandler - Vaccine scheduled event handler
 *
 * Creates in-app notifications when a vaccine is scheduled.
 *
 * This handler now works with parallel notifications emitted per user.
 * Each event contains a single user (either patient or nurse) identified by userRole.
 *
 * Notification recipients:
 * - Patient (userRole: 'patient') - receives confirmation of their scheduling
 * - Nurse (userRole: 'nurse') - receives notification of new assignment
 *
 * Triggered by:
 * - VaccineSchedulingService.create() (emits parallel events for patient and nurse)
 */

import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@infrastructure/di/tokens';
import type { INotificationStore } from '@modules/notifications/contracts';
import type { VaccineScheduledEvent } from '@modules/notifications/contracts';
import {
  createPatientVaccineScheduledNotification,
  createNurseVaccineScheduledNotification,
} from '@shared/helpers/notificationHelper';

@injectable()
export class InAppVaccineScheduledHandler {
  constructor(
    @inject(TOKENS.INotificationStore)
    private readonly notificationStore: INotificationStore,
  ) {}

  /**
   * Handle vaccine scheduled event
   *
   * Routes notification creation to the appropriate helper based on userRole.
   * Errors are logged but don't throw to prevent event bus failures.
   */
  async handle(event: VaccineScheduledEvent): Promise<void> {
    try {
      // Only handle in-app notifications
      if (!event.channels.includes('in-app')) {
        return;
      }

      const { data } = event;

      // Route to appropriate notification helper based on user role
      if (data.userRole === 'patient') {
        await createPatientVaccineScheduledNotification(
          this.notificationStore,
          data,
        );
      } else if (data.userRole === 'nurse') {
        await createNurseVaccineScheduledNotification(
          this.notificationStore,
          data,
        );
      } else {
        console.warn(
          `[InAppVaccineScheduledHandler] Unknown userRole: ${data.userRole}`,
        );
      }
    } catch (error) {
      // Log error but don't throw - we don't want to break the event bus
      console.error(
        '[InAppVaccineScheduledHandler] Error creating notification:',
        error,
      );
      // In production, use proper logger and maybe emit a monitoring event
    }
  }
}
