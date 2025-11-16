import type { VaccineBatch, BatchStatus } from '@infrastructure/database';
import type { PaginatedResponse, PaginationParams } from './pagination';
import type { IBaseStore } from '@shared/stores/baseStore';
import type {
  VaccineBatchCreateInput,
  VaccineBatchUpdateInput,
} from '@shared/models/vaccineBatch';

/**
 * Filter parameters for querying vaccine batches
 */
export interface VaccineBatchFilterParams {
  /**
   * Filter by specific vaccine ID
   */
  vaccineId?: string;

  /**
   * Filter by batch status
   * - AVAILABLE: Batch is available for use
   * - EXPIRED: Batch has passed expiration date
   * - DEPLETED: Batch quantity is 0
   * - DISCARDED: Batch was manually discarded
   */
  status?: BatchStatus;

  /**
   * Filter batches expiring before this date
   * Useful for finding batches that need urgent use
   */
  expiringBefore?: Date;

  /**
   * Filter batches expiring after this date
   */
  expiringAfter?: Date;

  /**
   * Filter batches with current quantity greater than this value
   * Useful for finding batches with sufficient stock
   */
  minQuantity?: number;

  /**
   * Include soft-deleted batches in results
   * Default: false (exclude deleted batches)
   */
  includeDeleted?: boolean;
}

/**
 * Statistics for vaccine batch inventory
 */
export interface VaccineBatchStatistics {
  /**
   * Total number of batches (excluding deleted)
   */
  totalBatches: number;

  /**
   * Total quantity across all available batches
   */
  totalQuantityAvailable: number;

  /**
   * Number of batches that are AVAILABLE
   */
  availableBatches: number;

  /**
   * Number of batches that are EXPIRED
   */
  expiredBatches: number;

  /**
   * Number of batches that are DEPLETED
   */
  depletedBatches: number;

  /**
   * Number of batches that are DISCARDED
   */
  discardedBatches: number;

  /**
   * Number of batches expiring within next 30 days
   */
  batchesExpiringSoon: number;
}

/**
 * Store interface for VaccineBatch operations
 *
 * This interface defines all database operations for vaccine batch management,
 * including CRUD operations, stock management, expiration tracking, and reporting.
 *
 * Design Principles:
 * - Separation of concerns: Store handles only data access
 * - Business logic belongs in VaccineBatchService
 * - All methods should be idempotent where possible
 * - Soft delete is preferred over hard delete for audit trail
 */
export interface IVaccineBatchStore
  extends IBaseStore<
    VaccineBatch,
    VaccineBatchCreateInput,
    VaccineBatchUpdateInput
  > {
  // ==========================================
  // BATCH-SPECIFIC QUERY METHODS
  // ==========================================
  // Note: Basic CRUD (findById, findAll, create, update, delete, softDelete)
  // are inherited from IBaseStore

  /**
   * Finds a vaccine batch by batch number
   * Batch numbers are unique across the system
   *
   * @param batchNumber - Unique batch identifier
   * @returns Batch if found, null otherwise
   *
   * @example
   * const batch = await batchStore.findByBatchNumber('LOT-2024-001');
   */
  findByBatchNumber(batchNumber: string): Promise<VaccineBatch | null>;

  /**
   * Finds paginated vaccine batches with optional filtering and sorting
   *
   * @param params - Pagination parameters (page, perPage, sortBy, sortOrder)
   * @param filters - Optional filter criteria
   * @returns Paginated response with batches and metadata
   *
   * @example
   * const result = await batchStore.findPaginatedBatches(
   *   { page: 1, perPage: 20, sortBy: 'expirationDate', sortOrder: 'asc' },
   *   { status: 'AVAILABLE', vaccineId: 'vaccine-id' }
   * );
   */
  findPaginatedBatches(
    params: PaginationParams,
    filters?: VaccineBatchFilterParams,
  ): Promise<PaginatedResponse<VaccineBatch>>;

  // ==========================================
  // STOCK MANAGEMENT
  // ==========================================

  /**
   * Decrements the current quantity of a batch
   * Automatically updates status to DEPLETED if quantity reaches 0
   *
   * @param id - Batch UUID
   * @param quantity - Amount to decrement
   * @returns Updated batch
   * @throws Error if quantity would go negative
   *
   * @example
   * // After vaccine application
   * const batch = await batchStore.decrementQuantity('batch-id', 1);
   */
  decrementQuantity(id: string, quantity: number): Promise<VaccineBatch>;

  /**
   * Increments the current quantity of a batch
   * Updates status to AVAILABLE if was DEPLETED
   *
   * @param id - Batch UUID
   * @param quantity - Amount to increment
   * @returns Updated batch
   *
   * @example
   * // Correction or batch adjustment
   * const batch = await batchStore.incrementQuantity('batch-id', 5);
   */
  incrementQuantity(id: string, quantity: number): Promise<VaccineBatch>;

  /**
   * Gets the current available quantity for a batch
   *
   * @param id - Batch UUID
   * @returns Current quantity, or null if batch not found
   *
   * @example
   * const quantity = await batchStore.getCurrentQuantity('batch-id');
   */
  getCurrentQuantity(id: string): Promise<number | null>;

  /**
   * Checks if a batch has sufficient quantity available
   *
   * @param id - Batch UUID
   * @param requiredQuantity - Required amount
   * @returns True if batch has enough quantity
   *
   * @example
   * const hasStock = await batchStore.hasAvailableQuantity('batch-id', 10);
   */
  hasAvailableQuantity(id: string, requiredQuantity: number): Promise<boolean>;

  // ==========================================
  // EXPIRATION MANAGEMENT
  // ==========================================

  /**
   * Finds all batches that have expired (expiration date < now)
   * but status is still AVAILABLE
   *
   * @returns Array of expired batches
   *
   * @example
   * const expired = await batchStore.findExpiredBatches();
   * // Mark them as EXPIRED
   */
  findExpiredBatches(): Promise<VaccineBatch[]>;

  /**
   * Finds batches expiring within a specified number of days
   * Useful for alerts and prioritization
   *
   * @param days - Number of days from now
   * @returns Array of batches expiring soon
   *
   * @example
   * // Find batches expiring in next 30 days
   * const expiringSoon = await batchStore.findBatchesExpiringSoon(30);
   */
  findBatchesExpiringSoon(days: number): Promise<VaccineBatch[]>;

  /**
   * Marks a batch as expired
   * Updates status to EXPIRED
   *
   * @param id - Batch UUID
   * @returns Updated batch
   *
   * @example
   * await batchStore.markAsExpired('batch-id');
   */
  markAsExpired(id: string): Promise<VaccineBatch>;

  /**
   * Marks multiple batches as expired in a single transaction
   * More efficient than marking one by one
   *
   * @param ids - Array of batch UUIDs
   * @returns Number of batches updated
   *
   * @example
   * const count = await batchStore.markMultipleAsExpired(['id1', 'id2']);
   */
  markMultipleAsExpired(ids: string[]): Promise<number>;

  /**
   * Checks if a batch is expired
   *
   * @param id - Batch UUID
   * @returns True if batch expiration date is in the past
   *
   * @example
   * const isExpired = await batchStore.isExpired('batch-id');
   */
  isExpired(id: string): Promise<boolean>;

  // ==========================================
  // QUERY HELPERS
  // ==========================================

  /**
   * Finds all batches for a specific vaccine
   *
   * @param vaccineId - Vaccine UUID
   * @param includeDeleted - Include soft-deleted batches
   * @returns Array of batches for the vaccine
   *
   * @example
   * const batches = await batchStore.findByVaccineId('vaccine-id');
   */
  findByVaccineId(
    vaccineId: string,
    includeDeleted?: boolean,
  ): Promise<VaccineBatch[]>;

  /**
   * Finds batches by status
   *
   * @param status - Batch status (AVAILABLE, EXPIRED, DEPLETED, DISCARDED)
   * @returns Array of batches with the specified status
   *
   * @example
   * const available = await batchStore.findByStatus('AVAILABLE');
   */
  findByStatus(status: BatchStatus): Promise<VaccineBatch[]>;

  /**
   * Finds the oldest batch for a vaccine that is still AVAILABLE
   * Implements FIFO (First In, First Out) strategy
   *
   * @param vaccineId - Vaccine UUID
   * @returns Oldest available batch, or null if none available
   *
   * @example
   * // Get next batch to use (FIFO)
   * const batch = await batchStore.findOldestAvailableBatch('vaccine-id');
   */
  findOldestAvailableBatch(vaccineId: string): Promise<VaccineBatch | null>;

  /**
   * Finds the batch closest to expiration for a vaccine that is still AVAILABLE
   * Implements FEFO (First Expired, First Out) strategy
   *
   * @param vaccineId - Vaccine UUID
   * @returns Batch closest to expiration, or null if none available
   *
   * @example
   * // Get batch expiring soonest (FEFO)
   * const batch = await batchStore.findBatchClosestToExpiration('vaccine-id');
   */
  findBatchClosestToExpiration(vaccineId: string): Promise<VaccineBatch | null>;

  // ==========================================
  // VALIDATION & EXISTENCE CHECKS
  // ==========================================

  /**
   * Checks if a batch number already exists
   * Used for validation before creating new batch
   *
   * @param batchNumber - Batch number to check
   * @returns True if batch number exists
   *
   * @example
   * const exists = await batchStore.batchNumberExists('LOT-2024-001');
   */
  batchNumberExists(batchNumber: string): Promise<boolean>;

  /**
   * Checks if a batch exists and is not soft-deleted
   *
   * @param id - Batch UUID
   * @returns True if batch exists and is active
   *
   * @example
   * const exists = await batchStore.exists('batch-id');
   */
  exists(id: string): Promise<boolean>;

  /**
   * Counts total batches (excluding soft-deleted)
   *
   * @param filters - Optional filter criteria
   * @returns Number of batches
   *
   * @example
   * const total = await batchStore.count({ status: 'AVAILABLE' });
   */
  count(filters?: VaccineBatchFilterParams): Promise<number>;

  // ==========================================
  // STATISTICS & REPORTING
  // ==========================================

  /**
   * Gets comprehensive statistics for vaccine batches
   *
   * @param vaccineId - Optional vaccine ID to filter statistics
   * @returns Statistics object with counts and totals
   *
   * @example
   * const stats = await batchStore.getStatistics('vaccine-id');
   * console.log(`Total available: ${stats.totalQuantityAvailable}`);
   */
  getStatistics(vaccineId?: string): Promise<VaccineBatchStatistics>;

  /**
   * Gets total available quantity across all batches for a vaccine
   *
   * @param vaccineId - Vaccine UUID
   * @returns Total quantity available
   *
   * @example
   * const total = await batchStore.getTotalAvailableQuantity('vaccine-id');
   */
  getTotalAvailableQuantity(vaccineId: string): Promise<number>;

  /**
   * Gets list of batches with low stock (below a threshold)
   *
   * @param threshold - Minimum quantity threshold
   * @returns Array of batches with quantity below threshold
   *
   * @example
   * const lowStock = await batchStore.findLowStockBatches(10);
   */
  findLowStockBatches(threshold: number): Promise<VaccineBatch[]>;
}
