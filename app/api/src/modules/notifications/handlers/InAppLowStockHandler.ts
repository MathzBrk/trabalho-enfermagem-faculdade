/**
 * InAppLowStockHandler - Low stock event handler
 *
 * Creates in-app notifications for ALL managers when vaccine stock is low.
 *
 * Notification recipients:
 * - All users with MANAGER role
 *
 * Priority:
 * - URGENT if stock < 50% of minimum
 * - HIGH otherwise
 *
 * Triggered by:
 * - Scheduled job that checks vaccine stock levels
 * - Manual trigger from admin panel
 * - After vaccine application (if stock drops below minimum)
 */

import { TOKENS } from '@infrastructure/di/tokens';
import type { INotificationStore } from '@modules/notifications/contracts';
import type { LowStockEvent } from '@modules/notifications/contracts';
import type { IUserStore } from '@shared/interfaces/user';
import { inject, injectable } from 'tsyringe';

@injectable()
export class InAppLowStockHandler {
  constructor(
    @inject(TOKENS.INotificationStore)
    private readonly notificationStore: INotificationStore,
    @inject(TOKENS.IUserStore)
    private readonly userStore: IUserStore,
  ) {}

  /**
   * Handle low stock event
   *
   * Fetches all managers and creates notifications for each.
   * Errors are logged but don't throw to prevent event bus failures.
   */
  async handle(event: LowStockEvent): Promise<void> {
    try {
      // Only handle in-app notifications
      if (!event.channels.includes('in-app')) {
        return;
      }

      const { data } = event;

      // Fetch all managers from database
      const managers = await this.userStore.findByRole('MANAGER');

      if (managers.length === 0) {
        console.warn('[InAppLowStockHandler] No managers found to notify');
        return;
      }

      // Determine urgency level based on stock percentage
      const stockPercentage = data.stockPercentage;
      const urgencyLevel = stockPercentage < 50 ? 'CRÍTICO' : 'ATENÇÃO';

      const message = `${urgencyLevel}: Estoque de ${data.vaccineName} está abaixo do mínimo. Quantidade atual: ${data.currentStock} dose(s). Mínimo recomendado: ${data.minStockLevel} dose(s). Nível: ${stockPercentage.toFixed(0)}% do mínimo.`;

      await Promise.all(
        managers.map((manager) =>
          this.notificationStore.create({
            userId: manager.id,
            type: 'LOW_STOCK',
            title: 'Estoque Baixo',
            message,
            metadata: {
              vaccineId: data.vaccineId,
              vaccineName: data.vaccineName,
              currentStock: data.currentStock,
              minStockLevel: data.minStockLevel,
              stockPercentage: data.stockPercentage,
              urgencyLevel: stockPercentage < 50 ? 'critical' : 'high',
            },
          }),
        ),
      );
    } catch (error) {
      // Log error but don't throw - we don't want to break the event bus
      console.error(
        '[InAppLowStockHandler] Error creating notifications:',
        error,
      );
      // In production, use proper logger and maybe emit a monitoring event
    }
  }
}
