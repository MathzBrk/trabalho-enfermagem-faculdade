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
import { formatDate } from './timeHelper';

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
  const formattedDate = formatDate(data.scheduledDate, 'DD/MM/YYYY HH:mm');

  await store.create({
    userId: data.patientId,
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
  const formattedDate = formatDate(data.scheduledDate, 'DD/MM/YYYY HH:mm');

  const { nurseEmail, nurseId, nurseName } = data;

  if(!nurseId || !nurseEmail || !nurseName) {
    console.warn(
      `[createNurseVaccineScheduledNotification] Missing nurse information for schedulingId: ${data.schedulingId}`,
    );
    return;
  }

  await store.create({
    userId: nurseId,
    type: 'GENERAL',
    title: 'Novo Agendamento',
    message: `Você foi designado(a) para aplicar ${data.vaccineName} em ${data.patientName} no dia ${formattedDate}.`,
    metadata: {
      schedulingId: data.schedulingId,
      vaccineId: data.vaccineId,
      vaccineName: data.vaccineName,
      scheduledDate: data.scheduledDate,
      doseNumber: data.doseNumber,
      patientName: data.patientName,
      patientEmail: data.patientEmail,
      userRole: data.userRole,
      nurseId,
      nurseName,
      nurseEmail,
    },
  });
};
