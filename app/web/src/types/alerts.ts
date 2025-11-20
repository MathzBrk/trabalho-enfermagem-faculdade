/**
 * Alert Types for Inventory Management
 * Based on /api/alerts endpoint documentation
 *
 * Note: Types are defined inline to avoid circular dependencies
 */

// Local type definitions to avoid circular dependency with index.ts
interface Vaccine {
  id: string;
  name: string;
  manufacturer: string;
  description?: string | null;
  dosesRequired: number;
  intervalDays?: number | null;
  minStockLevel?: number | null;
  totalStock?: number;
  currentStock?: number;
  isObligatory: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

interface VaccineBatch {
  id: string;
  vaccineId: string;
  vaccine?: Vaccine;
  batchNumber: string;
  initialQuantity: number;
  currentQuantity: number;
  expirationDate: string;
  receivedDate: string;
  status: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Alert Type Enums ====================

export const AlertType = {
  LOW_STOCK: 'LOW_STOCK',
  EXPIRED_BATCH: 'EXPIRED_BATCH',
  NEARING_EXPIRATION_BATCH: 'NEARING_EXPIRATION_BATCH',
} as const;

export type AlertType = (typeof AlertType)[keyof typeof AlertType];

// ==================== Alert Payload Types ====================

/**
 * Base alert payload structure
 */
export interface AlertPayload<T = Vaccine | VaccineBatch> {
  alertType: AlertType;
  objects: T[];
}

/**
 * Low stock alert - triggered when currentStock < minimumStock
 * Contains affected vaccines
 */
export interface LowStockAlert extends AlertPayload<Vaccine> {
  alertType: typeof AlertType.LOW_STOCK;
  objects: Vaccine[];
}

/**
 * Expired batch alert - triggered when expirationDate < current date
 * Contains expired vaccine batches
 */
export interface ExpiredBatchAlert extends AlertPayload<VaccineBatch> {
  alertType: typeof AlertType.EXPIRED_BATCH;
  objects: VaccineBatch[];
}

/**
 * Nearing expiration alert - triggered when expiration is 1-30 days away
 * Contains vaccine batches expiring soon
 */
export interface NearingExpirationAlert extends AlertPayload<VaccineBatch> {
  alertType: typeof AlertType.NEARING_EXPIRATION_BATCH;
  objects: VaccineBatch[];
}

/**
 * Union type for all alert types
 */
export type Alert = LowStockAlert | ExpiredBatchAlert | NearingExpirationAlert;

/**
 * Array of alerts returned by the API
 */
export type AlertsResponse = Alert[];

// ==================== Alert Configuration ====================

/**
 * Visual configuration for alert display
 */
export interface AlertDisplayConfig {
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium';
}

// ==================== Type Guards ====================

/**
 * Type guard to check if alert is LOW_STOCK
 */
export const isLowStockAlert = (alert: Alert): alert is LowStockAlert => {
  return alert.alertType === AlertType.LOW_STOCK;
};

/**
 * Type guard to check if alert is EXPIRED_BATCH
 */
export const isExpiredBatchAlert = (alert: Alert): alert is ExpiredBatchAlert => {
  return alert.alertType === AlertType.EXPIRED_BATCH;
};

/**
 * Type guard to check if alert is NEARING_EXPIRATION_BATCH
 */
export const isNearingExpirationAlert = (alert: Alert): alert is NearingExpirationAlert => {
  return alert.alertType === AlertType.NEARING_EXPIRATION_BATCH;
};
