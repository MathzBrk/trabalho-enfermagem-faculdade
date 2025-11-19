import type { VaccineScheduling } from '@infrastructure/database';
import type {
  VaccineSchedulingCreateInput,
  VaccineSchedulingUpdateInput,
  VaccineSchedulingWithRelations,
} from '@shared/models/vaccineScheduling';
import type { IBaseStore } from '@shared/stores/baseStore';
import type { PaginatedResponse, PaginationParams } from './pagination';

// Filter parameters for vaccine scheduling queries
export interface VaccineSchedulingFilterParams {
  userId?: string;
  vaccineId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

// Store interface extending IBaseStore
export interface IVaccineSchedulingStore
  extends IBaseStore<
    VaccineScheduling,
    VaccineSchedulingCreateInput,
    VaccineSchedulingUpdateInput
  > {
  findByIdWithRelations(
    id: string,
  ): Promise<VaccineSchedulingWithRelations | null>;
  findPaginatedSchedulings(
    params: PaginationParams,
    filters?: VaccineSchedulingFilterParams,
  ): Promise<PaginatedResponse<VaccineScheduling>>;
  existsByUserVaccineDose(
    userId: string,
    vaccineId: string,
    doseNumber: number,
  ): Promise<boolean>;
  findByUserAndVaccine(
    userId: string,
    vaccineId: string,
  ): Promise<VaccineScheduling[]>;
  findByVaccineId(vaccineId: string): Promise<VaccineScheduling[]>;
  getSchedulingsByDate(
    userId: string,
    date: Date,
  ): Promise<VaccineSchedulingWithRelations[]>;
  /**
   * Creates a vaccine scheduling with atomic stock validation
   *
   * This method ensures race condition safety by:
   * 1. Locking the vaccine row (FOR UPDATE) within a transaction
   * 2. Validating available stock atomically
   * 3. Creating the scheduling only if stock is available
   *
   * The entire operation is wrapped in a database transaction to guarantee
   * that no other concurrent request can create a scheduling for the same
   * vaccine between the stock check and scheduling creation.
   *
   * @param data - Vaccine scheduling creation data
   * @param vaccineId - ID of the vaccine to validate stock for
   * @returns Created vaccine scheduling
   * @throws InsufficientStockError if no available doses
   * @throws VaccineNotFoundError if vaccine not found or deleted
   */
  createSchedulingWithStockValidation(
    data: VaccineSchedulingCreateInput,
    vaccineId: string,
  ): Promise<VaccineScheduling>;
}
