/**
 * InAppVaccineAppliedHandler - Vaccine applied event handler
 *
 * Creates in-app notifications when a vaccine application is recorded (vaccine applied).
 *
 * This handler works with parallel notifications emitted per user. Each event contains
 * a single user (for example, the receiver/patient or the applicator/nurse) identified
 * by the event payload.
 *
 * Notification recipients:
 * - Patient (receiver) - receives confirmation that the vaccine was applied
 * - Applicator (appliedBy) - receives confirmation/record that they applied the vaccine
 *
 * Triggered by:
 * - VaccineApplicationService.create() (emits parallel events for involved users)
 *
 * Event type: EventNames.VACCINE_APPLIED
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
   * Handle vaccine applied event
   *
   * Routes notification creation to the appropriate helper based on the event data
   * (receiver/applicator). Errors are logged but not thrown to avoid breaking the event bus.
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
          `[InAppVaccineAppliedHandler] Invalid event type: ${type}`,
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

      if (!application || !batch || !vaccine || !receiver || !applicator) {
        console.error(
          '[InAppVaccineAppliedHandler] Missing required entity for notification creation:',
          {
            applicationMissing: !application,
            batchMissing: !batch,
            vaccineMissing: !vaccine,
            receiverMissing: !receiver,
            applicatorMissing: !applicator,
          },
        );
        return;
      }

      await createVaccineAppliedNotification(
        this.notificationStore,
        applicator,
        receiver,
        application,
        vaccine,
        batch,
      );
    } catch (error) {
      console.error(
        '[InAppVaccineAppliedHandler] Error creating notification:',
        error,
      );
    }
  }
}
