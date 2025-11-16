/**
 * InAppReportGeneratedHandler - Report generated event handler
 *
 * Creates in-app notification for the user who requested a report.
 *
 * Notification recipients:
 * - User who requested the report (generatedById)
 *
 * Triggered by:
 * - ReportService (when report generation completes)
 * - Background job processing report queue
 */

import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@infrastructure/di/tokens';
import type { INotificationStore } from '@modules/notifications/contracts';
import type { ReportGeneratedEvent } from '@modules/notifications/contracts';

@injectable()
export class InAppReportGeneratedHandler {
  constructor(
    @inject(TOKENS.INotificationStore)
    private readonly notificationStore: INotificationStore,
  ) {}

  /**
   * Handle report generated event
   *
   * Creates notification for report creator with download information.
   * Errors are logged but don't throw to prevent event bus failures.
   */
  async handle(event: ReportGeneratedEvent): Promise<void> {
    try {
      // Only handle in-app notifications
      if (!event.channels.includes('in-app')) {
        return;
      }

      const { data } = event;

      // Build message with optional file URL
      let message = `Seu relatório "${data.title}" foi gerado com sucesso e está pronto para visualização.`;

      if (data.fileUrl) {
        message += ` Acesse o link para fazer o download.`;
      }

      // Add period information if available
      if (data.startDate && data.endDate) {
        const startFormatted = new Date(data.startDate).toLocaleDateString(
          'pt-BR',
        );
        const endFormatted = new Date(data.endDate).toLocaleDateString('pt-BR');
        message += ` Período: ${startFormatted} a ${endFormatted}.`;
      }

      // Create notification for report creator
      await this.notificationStore.create({
        userId: data.generatedById,
        type: 'GENERAL',
        title: 'Relatório Pronto',
        message,
        metadata: {
          reportId: data.reportId,
          title: data.title,
          type: data.type,
          description: data.description,
          fileUrl: data.fileUrl,
          startDate: data.startDate,
          endDate: data.endDate,
          createdAt: data.createdAt,
        },
      });
    } catch (error) {
      // Log error but don't throw - we don't want to break the event bus
      console.error(
        '[InAppReportGeneratedHandler] Error creating notification:',
        error,
      );
      // In production, use proper logger and maybe emit a monitoring event
    }
  }
}
