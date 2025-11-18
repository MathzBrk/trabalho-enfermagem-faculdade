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

import { TOKENS } from '@infrastructure/di/tokens';
import {
  EventNames,
  type INotificationStore,
  type VaccineAppliedEvent,
} from '@modules/notifications/contracts';
import { createVaccineAppliedNotification } from '@shared/helpers/notificationHelper';

import type { IUserStore } from '@shared/interfaces/user';
import type { IVaccineStore } from '@shared/interfaces/vaccine';
import type { IVaccineApplicationStore } from '@shared/interfaces/vaccineApplication';
import type { IVaccineBatchStore } from '@shared/interfaces/vaccineBatch';
import { inject, injectable } from 'tsyringe';

@injectable()
export class InAppVaccineAppliedHandler {
  constructor(
    @inject(TOKENS.INotificationStore)
    private readonly notificationStore: INotificationStore,
    @inject(TOKENS.IVaccineApplicationStore)
    private readonly vaccineApplicationStore: IVaccineApplicationStore,
    @inject(TOKENS.IVaccineStore)
    private readonly vaccineStore: IVaccineStore,
    @inject(TOKENS.IUserStore)
    private readonly userStore: IUserStore,
    @inject(TOKENS.IVaccineBatchStore)
    private readonly vaccineBatchStore: IVaccineBatchStore,
  ) {}

  /**
   * Handle vaccine scheduled event
   *
   * Routes notification creation to the appropriate helper based on userRole.
   * Errors are logged but don't throw to prevent event bus failures.
   */
  async handle(event: VaccineAppliedEvent): Promise<void> {
    try {
      // Only handle in-app notifications
      if (!event.channels.includes('in-app')) {
        return;
      }
      const { data, type } = event;

      if (type !== EventNames.VACCINE_APPLIED) {
        throw new Error(
          `[InAppVaccineScheduledHandler] Invalid event type: ${type}`,
        );
      }

      const [application, batch, vaccine, receiver, applicator] =
        await Promise.all([
          this.vaccineApplicationStore.findById(data.applicationId),
          this.vaccineBatchStore.findById(data.batchId),
          this.vaccineStore.findById(data.vaccineId),
          this.userStore.findById(data.receiverId),
          this.userStore.findById(data.appliedById),
        ]);

      await createVaccineAppliedNotification(
        this.notificationStore,
        applicator!,
        receiver!,
        application!,
        vaccine!,
        batch!,
      );
    } catch (error) {
      console.error(
        '[InAppVaccineScheduledHandler] Error creating notification:',
        error,
      );
    }
  }
}
