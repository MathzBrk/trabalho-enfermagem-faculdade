/**
 * InAppNurseChangedHandler - Nurse reassignment event handler
 *
 * Creates in-app notifications when a nurse is reassigned on a scheduling.
 *
 * Notification recipients:
 * - Patient (userId) - informed of nurse change
 * - Old nurse (oldNurseId) - informed they were removed (if applicable)
 * - New nurse (newNurseId) - informed of new assignment (if applicable)
 *
 * Triggered by:
 * - VaccineSchedulingService.update() (when nurseId changes)
 */

import { TOKENS } from '@infrastructure/di/tokens';
import type { INotificationStore } from '@modules/notifications/contracts';
import type { NurseChangedEvent } from '@modules/notifications/contracts';
import { createNurseChangedNotification } from '@shared/helpers/notificationHelper';
import type { IUserStore } from '@shared/interfaces/user';
import type { IVaccineSchedulingStore } from '@shared/interfaces/vaccineScheduling';
import { inject, injectable } from 'tsyringe';

@injectable()
export class InAppNurseChangedHandler {
  constructor(
    @inject(TOKENS.INotificationStore)
    private readonly notificationStore: INotificationStore,
    @inject(TOKENS.IVaccineSchedulingStore)
    private readonly vaccineSchedulingStore: IVaccineSchedulingStore,
    @inject(TOKENS.IUserStore)
    private readonly userStore: IUserStore,
  ) {}

  /**
   * Handle nurse changed event
   *
   * Creates notifications for all affected parties: patient, old nurse, new nurse.
   * Errors are logged but don't throw to prevent event bus failures.
   */
  async handle(event: NurseChangedEvent): Promise<void> {
    try {
      // Only handle in-app notifications
      if (!event.channels.includes('in-app')) {
        return;
      }

      const { data } = event;

      const [scheduling, oldNurse, newNurse] = await Promise.all([
        this.vaccineSchedulingStore.findByIdWithRelations(data.schedulingId),
        this.userStore.findById(data.oldNurseId),
        this.userStore.findById(data.newNurseId),
      ]);

      if (!scheduling || !oldNurse || !newNurse) {
        throw new Error(
          `Scheduling or nurses not found for IDs provided. Data: ${JSON.stringify(data)}`,
        );
      }

      await createNurseChangedNotification(
        this.notificationStore,
        scheduling,
        oldNurse,
        newNurse,
      );
    } catch (error) {
      // Log error but don't throw - we don't want to break the event bus
      console.error(
        '[InAppNurseChangedHandler] Error creating notifications:',
        error,
      );
      // In production, use proper logger and maybe emit a monitoring event
    }
  }
}
