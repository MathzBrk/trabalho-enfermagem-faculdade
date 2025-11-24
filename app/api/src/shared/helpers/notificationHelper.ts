/**
 * Notification Helper Functions
 *
 * Reusable functions for creating specific types of notifications.
 * These helpers encapsulate the business logic for notification messages
 * and metadata, making it easy to create consistent notifications across
 * different event handlers.
 */

import type { User } from '@infrastructure/database';
import type { INotificationStore } from '@shared/interfaces/notification';
import type { Vaccine } from '@shared/models/vaccine';
import type { VaccineApplication } from '@shared/models/vaccineApplication';
import type { VaccineBatch } from '@shared/models/vaccineBatch';
import type { VaccineScheduledEventData } from '@shared/models/vaccineNotificationEvents';
import type { VaccineSchedulingWithRelations } from '@shared/models/vaccineScheduling';
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

  if (!nurseId || !nurseEmail || !nurseName) {
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

export const createVaccineAppliedNotification = async (
  store: INotificationStore,
  applicator: User,
  receiver: User,
  application: VaccineApplication,
  vaccine: Vaccine,
  batch: VaccineBatch,
): Promise<void> => {
  const formattedDate = formatDate(application.createdAt, 'DD/MM/YYYY HH:mm');

  await Promise.all([
    store.create({
      userId: receiver.id,
      type: 'VACCINE_APPLIED',
      title: 'Vacina Aplicada',
      message: `A vacina ${vaccine.name} foi aplicada em você por ${applicator.name} no dia ${formattedDate}. Dose: ${application.doseNumber}ª dose.`,
      metadata: {
        applicationId: application.id,
        vaccineId: vaccine.id,
        vaccineName: vaccine.name,
        batchId: batch.id,
        appliedAt: application.createdAt,
        doseNumber: application.doseNumber,
        receiverId: receiver.id,
        receiverName: receiver.name,
        receiverEmail: receiver.email,
      },
    }),
    store.create({
      userId: applicator.id,
      type: 'VACCINE_APPLIED',
      title: 'Vacina Aplicada',
      message: `Você aplicou a vacina ${vaccine.name} em ${receiver.name} no dia ${formattedDate}. Dose: ${application.doseNumber}ª dose.`,
      metadata: {
        applicationId: application.id,
        vaccineId: vaccine.id,
        vaccineName: vaccine.name,
        batchId: batch.id,
        appliedAt: application.createdAt,
        doseNumber: application.doseNumber,
        receiverName: receiver.name,
        applicatorId: applicator.id,
        applicatorName: applicator.name,
        applicatorEmail: applicator.email,
      },
    }),
  ]);
};

export const createNurseChangedNotification = async (
  store: INotificationStore,
  scheduling: VaccineSchedulingWithRelations,
  oldNurse: User,
  newNurse: User,
): Promise<void> => {
  console.log(
    '[createNurseChangedNotification] Creating nurse changed notifications',
  );
  const formattedDate = formatDate(
    scheduling.scheduledDate,
    'DD/MM/YYYY HH:mm',
  );

  await Promise.all([
    store.create({
      userId: oldNurse.id,
      type: 'GENERAL',
      title: 'Remoção de Agendamento',
      message: `Você foi removido(a) do agendamento da vacina ${scheduling.vaccine.name} para ${scheduling.user.name}, que estava marcado para ${formattedDate}.`,
      metadata: {
        schedulingId: scheduling.id,
        vaccineId: scheduling.vaccine.id,
        vaccineName: scheduling.vaccine.name,
        scheduledDate: scheduling.scheduledDate,
        doseNumber: scheduling.doseNumber,
        patientName: scheduling.user.name,
        patientEmail: scheduling.user.email,
      },
    }),
    store.create({
      userId: newNurse.id,
      type: 'GENERAL',
      title: 'Novo Agendamento',
      message: `Você foi designado(a) para aplicar ${scheduling.vaccine.name} em ${scheduling.user.name} no dia ${formattedDate}.`,
      metadata: {
        schedulingId: scheduling.id,
        vaccineId: scheduling.vaccine.id,
        vaccineName: scheduling.vaccine.name,
        scheduledDate: scheduling.scheduledDate,
        doseNumber: scheduling.doseNumber,
        patientName: scheduling.user.name,
        patientEmail: scheduling.user.email,
      },
    }),
    store.create({
      userId: scheduling.user.id,
      type: 'GENERAL',
      title: 'Alteração de Enfermagem',
      message: `Seu(a) enfermeiro(a) responsável pela aplicação da vacina ${scheduling.vaccine.name} foi alterado(a). O novo enfermeiro(a) é ${newNurse.name}.`,
      metadata: {
        schedulingId: scheduling.id,
        vaccineId: scheduling.vaccine.id,
        vaccineName: scheduling.vaccine.name,
        scheduledDate: scheduling.scheduledDate,
        doseNumber: scheduling.doseNumber,
        newNurseName: scheduling.assignedNurse!.name,
        newNurseEmail: scheduling.assignedNurse!.email,
      },
    }),
  ]);

  console.log(
    '[createNurseChangedNotification] Nurse changed notifications created successfully',
  );
};
