/**
 * Notification Helper Functions
 *
 * Reusable functions for creating specific types of notifications.
 * These helpers encapsulate the business logic for notification messages
 * and metadata, making it easy to create consistent notifications across
 * different event handlers.
 */

import type { INotificationStore } from '@shared/interfaces/notification';
import type { VaccineScheduledEventData } from '@shared/models/vaccineNotificationEvents';

/**
 * Creates a notification for a patient when their vaccine is scheduled
 *
 * @param store - Notification store instance
 * @param data - Event data containing scheduling information
 * @returns Promise that resolves when notification is created
 */
export const createPatientVaccineScheduledNotification = async (
  store: INotificationStore,
  data: VaccineScheduledEventData,
): Promise<void> => {
  const formattedDate = new Date(data.scheduledDate).toLocaleDateString(
    'pt-BR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );

  await store.create({
    userId: data.userId,
    type: 'SCHEDULING_CONFIRMED',
    title: 'Vacina Agendada',
    message: `Sua vacina ${data.vaccineName} foi agendada para ${formattedDate}. Dose: ${data.doseNumber}ª dose.`,
    metadata: {
      schedulingId: data.schedulingId,
      vaccineId: data.vaccineId,
      vaccineName: data.vaccineName,
      scheduledDate: data.scheduledDate,
      doseNumber: data.doseNumber,
      userRole: data.userRole,
    },
  });
};

/**
 * Creates a notification for a nurse when they are assigned to a vaccine scheduling
 *
 * @param store - Notification store instance
 * @param data - Event data containing scheduling and patient information
 * @returns Promise that resolves when notification is created
 */
export const createNurseVaccineScheduledNotification = async (
  store: INotificationStore,
  data: VaccineScheduledEventData,
): Promise<void> => {
  const formattedDate = new Date(data.scheduledDate).toLocaleDateString(
    'pt-BR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );

  await store.create({
    userId: data.userId,
    type: 'GENERAL',
    title: 'Novo Agendamento',
    message: `Você foi designado(a) para aplicar ${data.vaccineName} em ${data.userName} no dia ${formattedDate}.`,
    metadata: {
      schedulingId: data.schedulingId,
      vaccineId: data.vaccineId,
      vaccineName: data.vaccineName,
      scheduledDate: data.scheduledDate,
      doseNumber: data.doseNumber,
      patientName: data.userName,
      patientEmail: data.userEmail,
      userRole: data.userRole,
    },
  });
};
