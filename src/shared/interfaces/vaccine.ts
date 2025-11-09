import type { Vaccine } from '@infrastructure/database';
import type {
  VaccineCreateInput,
  VaccineUpdateInput,
} from '@shared/models/vaccine';
import type { IBaseStore } from '@shared/stores/baseStore';
import type { PaginatedResponse, PaginationParams } from './pagination';

export interface VaccineFilterParams {
  /** Filter by manufacturer name */
  manufacturer?: string;

  /** Filter by obligatory status */
  isObligatory?: boolean;
}

export interface IVaccineStore
  extends IBaseStore<Vaccine, VaccineCreateInput, VaccineUpdateInput> {
  findById(id: string, includeBatches?: boolean): Promise<Vaccine | null>;
  findByName(name: string): Promise<Vaccine | null>;
  findByNameAndManufacturer(
    name: string,
    manufacturer: string,
  ): Promise<Vaccine | null>;
  findAllByManufacturer(manufacturer: string): Promise<Vaccine[]>;
  findObligatoryVaccines(): Promise<Vaccine[]>;
  findPaginatedVaccines(
    params: PaginationParams,
    filters?: VaccineFilterParams,
  ): Promise<PaginatedResponse<Vaccine>>;

  /**
   * Atomically increments the vaccine's total stock
   *
   * This method performs an atomic increment operation at the database level,
   * preventing race conditions when multiple batches are being added concurrently.
   * The operation is safe even under high concurrency scenarios.
   *
   * @param vaccineId - UUID of the vaccine to update
   * @param amount - Positive integer amount to increment (must be > 0)
   * @returns Updated vaccine object with new totalStock
   * @throws Error if amount is not positive
   *
   * @example
   * const updatedVaccine = await vaccineStore.incrementStock('vaccine-id', 100);
   */
  incrementStock(vaccineId: string, amount: number): Promise<Vaccine>;

  /**
   * Atomically decrements the vaccine's total stock
   *
   * This method performs an atomic decrement operation at the database level,
   * preventing race conditions when batches are being removed or stock is consumed.
   * The operation is safe even under high concurrency scenarios.
   *
   * Note: The database layer does not enforce non-negative stock constraints.
   * Business logic validation should be performed at the service layer.
   *
   * @param vaccineId - UUID of the vaccine to update
   * @param amount - Positive integer amount to decrement (must be > 0)
   * @returns Updated vaccine object with new totalStock
   * @throws Error if amount is not positive
   *
   * @example
   * const updatedVaccine = await vaccineStore.decrementStock('vaccine-id', 50);
   */
  decrementStock(vaccineId: string, amount: number): Promise<Vaccine>;

  /**
   * Atomically deletes a vaccine and all its associated batches
   *
   * This method executes a transactional operation that ensures all-or-nothing semantics.
   * The deletion process follows these steps in a single database transaction:
   *
   * 1. Finds all AVAILABLE batches with currentQuantity > 0
   * 2. Calculates total stock to remove (sum of currentQuantity from AVAILABLE batches)
   * 3. If totalStockToRemove > 0, atomically decrements vaccine.totalStock
   * 4. Deletes all vaccine batches (CASCADE)
   * 5. Deletes the vaccine itself
   *
   * Transactional Guarantees:
   * - If any step fails, the entire operation is rolled back
   * - No partial deletions can occur
   * - Stock adjustment happens atomically before deletion
   * - Database remains in a consistent state even on failure
   *
   * Stock Adjustment Logic:
   * - Only AVAILABLE batches affect the stock count
   * - EXPIRED, DEPLETED, and DISCARDED batches do not contribute to totalStock
   * - Stock is decremented BEFORE deletion for safer operation
   *
   * CASCADE Behavior:
   * - All batches are deleted via deleteMany for efficiency
   * - Foreign key relationships are handled at database level (onDelete: Cascade)
   * - This provides a safety net if batches are deleted directly in database
   *
   * Error Handling:
   * - Throws if vaccine does not exist
   * - Transaction automatically rolls back on any database error
   * - All changes are reverted if rollback occurs
   *
   * @param vaccineId - UUID of the vaccine to delete
   * @returns Promise that resolves when deletion is complete
   * @throws Error if vaccine not found
   * @throws Error if transaction fails (with automatic rollback)
   *
   * @example
   * // Delete vaccine and all its batches atomically
   * await vaccineStore.deleteVaccineWithBatches('vaccine-id');
   * // If this succeeds, both vaccine and all batches are deleted
   * // If it fails, neither vaccine nor batches are deleted
   */
  deleteVaccineWithBatches(vaccineId: string): Promise<void>;
}
