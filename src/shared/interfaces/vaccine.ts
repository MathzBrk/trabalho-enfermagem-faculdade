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
}
