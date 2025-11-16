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

import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@infrastructure/di/tokens';
import type { INotificationStore } from '@modules/notifications/contracts';
import type { NurseChangedEvent } from '@modules/notifications/contracts';
import { formatDate } from '@shared/helpers/timeHelper';

@injectable()
export class InAppNurseChangedHandler {
  constructor(
    @inject(TOKENS.INotificationStore)
    private readonly notificationStore: INotificationStore,
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

      const formattedDate = formatDate(data.scheduledDate, 'DD/MM/YYYY HH:mm');

      // Create notification for patient
      const nurseChangeMessage = data.newNurseName
        ? `O(a) enfermeiro(a) ${data.newNurseName} foi designado(a) para sua vacinação de ${data.vaccineName} em ${formattedDate}.`
        : `Houve mudança no(a) enfermeiro(a) responsável pela sua vacinação de ${data.vaccineName} em ${formattedDate}.`;

      await this.notificationStore.create({
        userId: data.userId,
        type: 'GENERAL',
        title: 'Alteração no Agendamento',
        message: nurseChangeMessage,
        metadata: {
          schedulingId: data.schedulingId,
          vaccineId: data.vaccineId,
          vaccineName: data.vaccineName,
          scheduledDate: data.scheduledDate,
          oldNurseId: data.oldNurseId,
          oldNurseName: data.oldNurseName,
          newNurseId: data.newNurseId,
          newNurseName: data.newNurseName,
          reason: data.reason,
        },
      });

      // Create notification for old nurse (if there was one assigned before)
      if (data.oldNurseId) {
        await this.notificationStore.create({
          userId: data.oldNurseId,
          type: 'GENERAL',
          title: 'Agendamento Reatribuído',
          message: `Você foi removido(a) do agendamento de vacinação de ${data.userName} (${data.vaccineName}) em ${formattedDate}.${data.reason ? ` Motivo: ${data.reason}` : ''}`,
          metadata: {
            schedulingId: data.schedulingId,
            userId: data.userId,
            userName: data.userName,
            vaccineId: data.vaccineId,
            vaccineName: data.vaccineName,
            scheduledDate: data.scheduledDate,
            reason: data.reason,
          },
        });
      }

      // Create notification for new nurse (if one was assigned)
      if (data.newNurseId) {
        await this.notificationStore.create({
          userId: data.newNurseId,
          type: 'GENERAL',
          title: 'Novo Agendamento Atribuído',
          message: `Você foi designado(a) para aplicar ${data.vaccineName} em ${data.userName} no dia ${formattedDate}.`,
          metadata: {
            schedulingId: data.schedulingId,
            userId: data.userId,
            userName: data.userName,
            vaccineId: data.vaccineId,
            vaccineName: data.vaccineName,
            scheduledDate: data.scheduledDate,
            doseNumber: data.doseNumber,
          },
        });
      }
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
