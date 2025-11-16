/**
 * Batch/Stock Notification Events
 *
 * Event definitions for vaccine batch and inventory-related notifications.
 * These events are typically emitted by scheduled jobs or VaccineBatchService.
 */

import type { NotificationEvent } from './notificationEvent';

// ============================================
// Batch Expiring Event
// ============================================

/**
 * Data payload for batch expiration warning event
 *
 * Emitted when a vaccine batch is approaching its expiration date.
 * The threshold is configurable via BATCH_EXPIRING_DAYS_THRESHOLD env var (default: 30 days).
 *
 * Target audience: MANAGER role users (all managers receive this notification)
 */
export interface BatchExpiringEventData {
  batchId: string;
  batchNumber: string;
  vaccineId: string;
  vaccineName: string;
  manufacturer: string;
  expirationDate: Date;
  daysUntilExpiration: number;
  currentQuantity: number;
}

/**
 * Batch expiring event
 *
 * @example
 * eventBus.emit<BatchExpiringEvent>('batch.expiring', {
 *   type: 'batch.expiring',
 *   channels: ['in-app', 'email'],
 *   data: {
 *     batchNumber: 'ABC123',
 *     vaccineName: 'COVID-19',
 *     manufacturer: 'Pfizer',
 *     expirationDate: new Date('2025-12-31'),
 *     daysUntilExpiration: 15,
 *     currentQuantity: 50
 *   },
 *   priority: daysUntilExpiration <= 7 ? 'urgent' : 'high'
 * });
 */
export type BatchExpiringEvent = NotificationEvent<BatchExpiringEventData>;

// ============================================
// Low Stock Event
// ============================================

/**
 * Data payload for low stock alert event
 *
 * Emitted when a vaccine's total stock falls below the minimum threshold.
 * The threshold is defined per vaccine in the database (minStockLevel field).
 *
 * Target audience: MANAGER role users (all managers receive this notification)
 */
export interface LowStockEventData {
  vaccineId: string;
  vaccineName: string;
  manufacturer: string;
  currentStock: number;
  minStockLevel: number;
  stockPercentage: number; // Current stock as percentage of minimum (e.g., 50 = 50% of minimum)
}

/**
 * Low stock event
 *
 * @example
 * eventBus.emit<LowStockEvent>('stock.low', {
 *   type: 'stock.low',
 *   channels: ['in-app', 'email'],
 *   data: {
 *     vaccineName: 'COVID-19',
 *     manufacturer: 'Pfizer',
 *     currentStock: 5,
 *     minStockLevel: 10,
 *     stockPercentage: 50
 *   },
 *   priority: stockPercentage < 50 ? 'urgent' : 'high'
 * });
 */
export type LowStockEvent = NotificationEvent<LowStockEventData>;
