/**
 * Report Notification Events
 *
 * Event definitions for report generation notifications.
 * These events are emitted by the ReportService (to be implemented).
 */

import type { ReportType } from '@infrastructure/database/generated/prisma';
import type { NotificationEvent } from './notificationEvent';

// ============================================
// Report Generated Event
// ============================================

/**
 * Data payload for report generation completion event
 *
 * Emitted when a report has been successfully generated and is ready for download.
 * Contains metadata about the report and a link/URL to access it.
 *
 * Target audience: The user who requested the report (generatedById)
 */
export interface ReportGeneratedEventData {
  reportId: string;
  title: string;
  type: ReportType; // GENERAL, BY_EMPLOYEE, BY_VACCINE, BY_PERIOD, COVERAGE
  description?: string;
  fileUrl?: string; // URL or path to download the generated file (PDF, Excel, etc.)
  generatedById: string;
  generatedByName: string;
  generatedByEmail: string;
  startDate?: Date; // Report period start (if applicable)
  endDate?: Date; // Report period end (if applicable)
  createdAt: Date;
}

/**
 * Report generated event
 *
 * @example
 * eventBus.emit<ReportGeneratedEvent>('report.generated', {
 *   type: 'report.generated',
 *   channels: ['in-app', 'email'],
 *   data: {
 *     reportId: '456',
 *     title: 'Relatório de Vacinação - Janeiro 2025',
 *     type: 'BY_PERIOD',
 *     description: 'Relatório mensal de vacinações realizadas',
 *     fileUrl: 'https://storage.example.com/reports/january-2025.pdf',
 *     generatedById: '789',
 *     generatedByName: 'Dr. Carlos Silva',
 *     generatedByEmail: 'carlos@hospital.com',
 *     startDate: new Date('2025-01-01'),
 *     endDate: new Date('2025-01-31'),
 *     createdAt: new Date()
 *   },
 *   priority: 'normal'
 * });
 */
export type ReportGeneratedEvent = NotificationEvent<ReportGeneratedEventData>;
