/**
 * InAppBatchExpiringHandler - Batch expiring event handler
 *
 * Creates in-app notifications for ALL managers when a batch is expiring.
 *
 * Notification recipients:
 * - All users with MANAGER role
 *
 * Priority:
 * - URGENT if expiring in < 7 days
 * - HIGH otherwise
 *
 * Triggered by:
 * - Scheduled job that checks batch expiration dates
 * - Manual trigger from admin panel
 */

import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@infrastructure/di/tokens';
import type { INotificationStore } from '@modules/notifications/contracts';
import type { BatchExpiringEvent } from '@modules/notifications/contracts';
import type { IUserStore } from '@shared/interfaces/user';
import { formatDate } from '@shared/helpers/timeHelper';

@injectable()
export class InAppBatchExpiringHandler {
  constructor(
    @inject(TOKENS.INotificationStore)
    private readonly notificationStore: INotificationStore,
    @inject(TOKENS.IUserStore)
    private readonly userStore: IUserStore,
  ) {}

  /**
   * Handle batch expiring event
   *
   * Fetches all managers and creates notifications for each.
   * Errors are logged but don't throw to prevent event bus failures.
   */
  async handle(event: BatchExpiringEvent): Promise<void> {
    try {
      // Only handle in-app notifications
      if (!event.channels.includes('in-app')) {
        return;
      }

      const { data } = event;

      // Fetch all managers from database
      const managers = await this.userStore.findByRole('MANAGER');

      if (managers.length === 0) {
        console.warn('[InAppBatchExpiringHandler] No managers found to notify');
        return;
      }

      const formattedExpirationDate = formatDate(
        data.expirationDate,
        'DD/MM/YYYY',
      );

      const urgencyLevel =
        data.daysUntilExpiration <= 7 ? 'URGENTE' : 'IMPORTANTE';
      const message = `${urgencyLevel}: Lote ${data.batchNumber} de ${data.vaccineName} (${data.manufacturer}) vence em ${data.daysUntilExpiration} dia(s) (${formattedExpirationDate}). Quantidade restante: ${data.currentQuantity} doses.`;

      // Create notification for each manager
      // Using Promise.all for parallel creation
      await Promise.all(
        managers.map((manager) =>
          this.notificationStore.create({
            userId: manager.id,
            type: 'VACCINE_EXPIRING',
            title: 'Lote Próximo ao Vencimento',
            message,
            metadata: {
              batchId: data.batchId,
              batchNumber: data.batchNumber,
              vaccineId: data.vaccineId,
              vaccineName: data.vaccineName,
              manufacturer: data.manufacturer,
              expirationDate: data.expirationDate,
              daysUntilExpiration: data.daysUntilExpiration,
              currentQuantity: data.currentQuantity,
            },
          }),
        ),
      );
    } catch (error) {
      // Log error but don't throw - we don't want to break the event bus
      console.error(
        '[InAppBatchExpiringHandler] Error creating notifications:',
        error,
      );
      // In production, use proper logger and maybe emit a monitoring event
    }
  }
}
