import { TOKENS } from '@infrastructure/di/tokens';
import type { UserService } from '@modules/user/services/userService';
import {
  BatchNumberAlreadyExistsError,
  ExpiredBatchError,
  InvalidBatchQuantityError,
  VaccineBatchNotFoundError,
} from '@modules/vaccines-batch/errors';
import { VaccineNotFoundError } from '@modules/vaccines/errors';
import type {
  IVaccineBatchStore,
  VaccineBatchFilterParams,
} from '@shared/interfaces/vaccineBatch';
import type { IVaccineStore } from '@shared/interfaces/vaccine';
import type {
  PaginatedResponse,
  PaginationParams,
} from '@shared/interfaces/pagination';
import type {
  CreateVaccineBatchDTO,
  UpdateVaccineBatchDTO,
  VaccineBatch,
} from '@shared/models/vaccineBatch';
import { inject, injectable } from 'tsyringe';
import { getCurrentDate, isDateInFuture } from '@shared/helpers/timeHelper';
import { ValidationError } from '@modules/user/errors';

/**
 * VaccineBatchService - Service layer for vaccine batch business logic
 *
 * Responsible for:
 * - Vaccine batch creation with validation and authorization
 * - Vaccine batch retrieval with filtering
 * - Stock management operations
 * - Business rules enforcement
 * - Orchestrating store operations
 *
 * Architecture:
 * - Uses stores directly to avoid circular dependencies
 * - Depends on UserService (not IUserStore) for proper encapsulation
 * - Uses IVaccineStore directly to validate vaccine existence and update stock
 * - Respects bounded contexts and DDD principles
 */
@injectable()
export class VaccineBatchService {
  constructor(
    @inject(TOKENS.IVaccineBatchStore)
    private readonly vaccineBatchStore: IVaccineBatchStore,
    @inject(TOKENS.UserService) private readonly userService: UserService,
    @inject(TOKENS.IVaccineStore)
    private readonly vaccineStore: IVaccineStore,
  ) {}

  /**
   * Creates a new vaccine batch in the system
   *
   * Business Rules:
   * - Only MANAGER role can create vaccine batches
   * - Vaccine must exist in the system
   * - Batch number must be unique
   * - Quantity must be a positive integer
   * - Expiration date must be in the future
   * - Both initialQuantity and currentQuantity are set to input quantity
   * - Received date defaults to now() if not provided
   * - Updates the vaccine's totalStock by incrementing it with the batch quantity
   * - Tracks which user created the batch
   *
   * Authorization:
   * - Uses UserService.validateManagerRole() for encapsulated authorization
   *
   * @param data - Vaccine batch creation data
   * @param userId - ID of the user creating the batch
   * @returns Created vaccine batch object
   * @throws UserNotFoundError if user not found (from UserService)
   * @throws ForbiddenError if user is not MANAGER (from UserService)
   * @throws VaccineNotFoundError if vaccine does not exist
   * @throws BatchNumberAlreadyExistsError if batch number already exists
   * @throws InvalidBatchQuantityError if quantity is invalid
   * @throws ExpiredBatchError if expiration date is in the past
   *
   * @example
   * const batch = await vaccineBatchService.createVaccineBatch({
   *   vaccineId: "vaccine-uuid",
   *   batchNumber: "LOT-2024-001",
   *   quantity: 1000,
   *   expirationDate: new Date('2025-12-31'),
   *   receivedDate: new Date()
   * }, 'manager-user-id');
   */
  async createVaccineBatch(
    data: CreateVaccineBatchDTO,
    userId: string,
  ): Promise<VaccineBatch> {
    // Authorization: validate user exists and has MANAGER role
    // This delegates to UserService, respecting bounded contexts
    await this.userService.validateManagerRole(userId);

    // Validate vaccine exists using store directly
    const vaccine = await this.vaccineStore.findById(data.vaccineId);
    if (!vaccine) {
      throw new VaccineNotFoundError(
        `Vaccine with ID ${data.vaccineId} not found`,
      );
    }

    // Validate batch number uniqueness
    const batchNumberExists = await this.vaccineBatchStore.batchNumberExists(
      data.batchNumber,
    );
    if (batchNumberExists) {
      throw new BatchNumberAlreadyExistsError(data.batchNumber);
    }

    if (!isDateInFuture(data.expirationDate)) {
      throw new ExpiredBatchError('Expiration date must be in the future');
    }

    // Create vaccine batch
    // Both initialQuantity and currentQuantity are set to the input quantity
    const newBatch = await this.vaccineBatchStore.create({
      batchNumber: data.batchNumber,
      initialQuantity: data.quantity,
      currentQuantity: data.quantity,
      expirationDate: data.expirationDate,

      receivedDate: data.receivedDate ?? getCurrentDate(),
      status: 'AVAILABLE',
      vaccine: {
        connect: { id: data.vaccineId },
      },
      createdBy: {
        connect: { id: userId },
      },
    });

    // Atomically increment the vaccine's totalStock
    // Uses store's atomic operation to prevent race conditions
    await this.vaccineStore.incrementStock(data.vaccineId, data.quantity);

    return newBatch;
  }

  async updateVaccineBatch(
    batchId: string,
    data: UpdateVaccineBatchDTO,
    userId: string,
  ): Promise<VaccineBatch> {
    if (!Object.keys(data).length) {
      throw new ValidationError(
        'At least one field must be provided for update',
      );
    }
    await this.userService.validateManagerRole(userId);
    const existingBatch = await this.vaccineBatchStore.findById(batchId);
    if (!existingBatch) {
      throw new VaccineBatchNotFoundError(`Batch with ID ${batchId} not found`);
    }
    const vaccine = await this.vaccineStore.findById(existingBatch.vaccineId);
    if (!vaccine) {
      throw new VaccineNotFoundError(
        `Vaccine with ID ${existingBatch.vaccineId} not found`,
      );
    }

    // Business rule: Cannot update quantity and status at the same time
    const isUpdatingQuantity = data.quantity !== undefined;
    const isUpdatingStatus =
      data.status !== undefined && data.status !== existingBatch.status;

    if (isUpdatingQuantity && isUpdatingStatus) {
      throw new InvalidBatchQuantityError(
        'Cannot update quantity and status at the same time. Please update them separately.',
      );
    }

    const normalizedData: UpdateVaccineBatchDTO =
      await this.normalizeAndValidateUpdateData(data, existingBatch);

    // Prepare data for Prisma update (exclude quantity, use currentQuantity instead)
    const { quantity, ...prismaData } = normalizedData;
    const updatedBatch = await this.vaccineBatchStore.update(batchId, {
      ...prismaData,
      updatedAt: getCurrentDate(),
      currentQuantity: quantity ?? existingBatch.currentQuantity,
    });

    // Handle stock adjustments using atomic operations
    // Check if status is changing from AVAILABLE to DISCARDED/EXPIRED
    const isBecomingUnavailable =
      normalizedData.status &&
      (normalizedData.status === 'DISCARDED' ||
        normalizedData.status === 'EXPIRED') &&
      existingBatch.status === 'AVAILABLE';

    if (isBecomingUnavailable) {
      // If becoming unavailable, atomically decrement stock by current quantity
      const decrementAmount = existingBatch.currentQuantity;
      if (decrementAmount > 0) {
        await this.vaccineStore.decrementStock(
          existingBatch.vaccineId,
          decrementAmount,
        );
      }
    } else if (
      normalizedData.quantity !== undefined &&
      existingBatch.status === 'AVAILABLE'
    ) {
      // Adjust stock based on quantity correction using atomic operations
      const stockDelta = normalizedData.quantity - existingBatch.currentQuantity;

      if (stockDelta > 0) {
        // Quantity increased - atomically increment
        await this.vaccineStore.incrementStock(existingBatch.vaccineId, stockDelta);
      } else if (stockDelta < 0) {
        // Quantity decreased - atomically decrement
        await this.vaccineStore.decrementStock(
          existingBatch.vaccineId,
          Math.abs(stockDelta),
        );
      }
      // If stockDelta === 0, no stock update needed
    }

    return updatedBatch;
  }

  private async normalizeAndValidateUpdateData(
    data: UpdateVaccineBatchDTO,
    existingBatch: VaccineBatch,
  ): Promise<UpdateVaccineBatchDTO> {
    const normalizedData: UpdateVaccineBatchDTO = {};

    if (data.batchNumber !== undefined) {
      // Validate batch number uniqueness if it's being changed
      if (data.batchNumber !== existingBatch.batchNumber) {
        const batchNumberExists =
          await this.vaccineBatchStore.batchNumberExists(data.batchNumber);
        if (batchNumberExists) {
          throw new BatchNumberAlreadyExistsError(data.batchNumber);
        }
      }
      normalizedData.batchNumber = data.batchNumber;
    }

    // Note: quantity is handled separately in the update method
    // It's stored in normalizedData for business logic calculation only
    // The actual Prisma update uses currentQuantity
    if (data.quantity !== undefined) {
      normalizedData.quantity = data.quantity;
    }

    if (data.expirationDate !== undefined) {
      if (!isDateInFuture(data.expirationDate)) {
        throw new ExpiredBatchError('Expiration date must be in the future');
      }
      normalizedData.expirationDate = data.expirationDate;
    }

    if (data.receivedDate !== undefined) {
      normalizedData.receivedDate = data.receivedDate;
    }

    if (data.status !== undefined) {
      normalizedData.status = data.status;
    }

    return normalizedData;
  }

  async findVaccineBatches(vaccineId: string): Promise<VaccineBatch[]> {
    return this.vaccineBatchStore.findByVaccineId(vaccineId);
  }

  /**
   * Retrieves paginated vaccine batches for a specific vaccine
   *
   * Business Rules:
   * - Returns batches filtered by vaccineId
   * - Supports pagination and sorting
   * - Supports additional filters (status, expiration dates, quantity)
   * - Only non-deleted batches are returned by default
   *
   * @param vaccineId - Vaccine UUID to filter batches
   * @param params - Pagination parameters (page, perPage, sortBy, sortOrder)
   * @param filters - Optional additional filter criteria
   * @returns Paginated response with vaccine batches
   *
   * @example
   * const batches = await vaccineBatchService.findPaginatedByVaccineId(
   *   'vaccine-id',
   *   { page: 1, perPage: 20, sortBy: 'expirationDate', sortOrder: 'asc' },
   *   { status: 'AVAILABLE' }
   * );
   */
  async findPaginatedByVaccineId(
    vaccineId: string,
    params: PaginationParams,
    filters?: Partial<VaccineBatchFilterParams>,
  ): Promise<PaginatedResponse<VaccineBatch>> {
    // Merge vaccineId filter with other filters
    const mergedFilters: VaccineBatchFilterParams = {
      ...filters,
      vaccineId,
    };

    // Delegate to store for paginated results
    return this.vaccineBatchStore.findPaginatedBatches(params, mergedFilters);
  }

  async deleteVaccineBatch(batchId: string): Promise<void> {
    // Retrieve the batch before deletion
    const batch = await this.vaccineBatchStore.findById(batchId);
    if (!batch) {
      throw new VaccineBatchNotFoundError(batchId);
    }

    // If batch is AVAILABLE, atomically decrement vaccine's totalStock
    if (batch.status === 'AVAILABLE' && batch.currentQuantity > 0) {
      // Verify vaccine exists before attempting stock adjustment
      const vaccine = await this.vaccineStore.findById(batch.vaccineId);
      if (!vaccine) {
        throw new VaccineNotFoundError(batch.vaccineId);
      }

      // Atomically decrement stock using store's atomic operation
      // This prevents race conditions when deleting multiple batches concurrently
      await this.vaccineStore.decrementStock(
        batch.vaccineId,
        batch.currentQuantity,
      );
    }

    // Delete the batch from the database
    await this.vaccineBatchStore.delete(batchId);
  }
}
