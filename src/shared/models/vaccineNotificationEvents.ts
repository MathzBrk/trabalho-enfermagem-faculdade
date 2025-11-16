/**
 * Vaccine Notification Events
 *
 * Event definitions for vaccine-related notifications.
 * These events are emitted by VaccineSchedulingService and VaccineApplicationService.
 */

import type { NotificationEvent } from './notificationEvent';

// ============================================
// Vaccine Scheduled Event
// ============================================

/**
 * Data payload for vaccine scheduling event
 *
 * Emitted when a vaccine is scheduled for a patient.
 * Contains all information needed to notify the patient and assigned nurse.
 */
export interface VaccineScheduledEventData {
  schedulingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: 'patient' | 'nurse';
  vaccineId: string;
  vaccineName: string;
  scheduledDate: Date;
  doseNumber: number;
}

/**
 * Vaccine scheduled event
 *
 * @example
 * eventBus.emit<VaccineScheduledEvent>('vaccine.scheduled', {
 *   type: 'vaccine.scheduled',
 *   channels: ['in-app', 'email'],
 *   data: {
 *     userId: '123',
 *     userName: 'João Silva',
 *     userEmail: 'joao@example.com',
 *     vaccineName: 'COVID-19',
 *     scheduledDate: new Date(),
 *     doseNumber: 1,
 *     nurseName: 'Maria Santos',
 *     nurseEmail: 'maria@hospital.com'
 *   },
 *   priority: 'normal'
 * });
 */
export type VaccineScheduledEvent =
  NotificationEvent<VaccineScheduledEventData>;

// ============================================
// Nurse Changed Event
// ============================================

/**
 * Data payload for nurse reassignment event
 *
 * Emitted when a nurse is reassigned on an existing scheduling.
 * Contains information about the patient, old nurse, and new nurse.
 */
export interface NurseChangedEventData {
  schedulingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  vaccineId: string;
  vaccineName: string;
  scheduledDate: Date;
  doseNumber: number;
  oldNurseId?: string;
  oldNurseName?: string;
  oldNurseEmail?: string;
  newNurseId?: string;
  newNurseName?: string;
  newNurseEmail?: string;
  reason?: string; // Why the nurse was changed (e.g., "Substituição por falta")
}

/**
 * Nurse changed event
 *
 * @example
 * eventBus.emit<NurseChangedEvent>('nurse.changed', {
 *   type: 'nurse.changed',
 *   channels: ['in-app', 'email'],
 *   data: {
 *     userId: '123',
 *     userName: 'João Silva',
 *     userEmail: 'joao@example.com',
 *     vaccineName: 'COVID-19',
 *     oldNurseName: 'Maria Santos',
 *     newNurseName: 'Ana Costa',
 *     reason: 'Substituição por falta'
 *   },
 *   priority: 'high'
 * });
 */
export type NurseChangedEvent = NotificationEvent<NurseChangedEventData>;

// ============================================
// Vaccine Applied Event (Future)
// ============================================

/**
 * Data payload for vaccine application event
 *
 * Emitted when a vaccine is actually administered to a patient.
 * Contains confirmation details and batch information.
 *
 * Note: Handler not yet implemented, but event type defined for future use.
 */
export interface VaccineAppliedEventData {
  applicationId: string;
  userId: string;
  userName: string;
  userEmail: string;
  vaccineId: string;
  vaccineName: string;
  doseNumber: number;
  appliedById: string;
  appliedByName: string;
  applicationDate: Date;
  batchNumber: string;
  nextDoseDate?: Date; // If applicable for multi-dose vaccines
}

/**
 * Vaccine applied event
 *
 * Note: This event type is defined but handler is not yet implemented.
 * Will be used when VaccineApplicationService is integrated with the event system.
 */
export type VaccineAppliedEvent = NotificationEvent<VaccineAppliedEventData>;
