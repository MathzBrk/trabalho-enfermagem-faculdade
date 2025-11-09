import { TOKENS } from '@infrastructure/di/tokens';
import type { UserService } from '@modules/user/services/userService';
import {
  BatchNumberAlreadyExistsError,
  ExpiredBatchError,
  InvalidBatchQuantityError,
} from '@modules/vaccines-batch/errors';
import { VaccineNotFoundError } from '@modules/vaccines/errors';
import type { IVaccineBatchStore } from '@shared/interfaces/vaccineBatch';
import type { IVaccineStore } from '@shared/interfaces/vaccine';
import type {
  CreateVaccineBatchDTO,
  VaccineBatch,
} from '@shared/models/vaccineBatch';
import { inject, injectable } from 'tsyringe';
import { getCurrentDate, isDateInFuture } from '@shared/helpers/timeHelper';

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
 * - Follows Service → Service communication pattern
 * - Depends on UserService (not IUserStore) for proper encapsulation
 * - Depends on IVaccineStore to validate vaccine existence
 * - Respects bounded contexts and DDD principles
 */
@injectable()
export class VaccineBatchService {
  constructor(
    @inject(TOKENS.IVaccineBatchStore)
    private readonly vaccineBatchStore: IVaccineBatchStore,
    @inject(TOKENS.UserService) private readonly userService: UserService,
    @inject(TOKENS.IVaccineStore) private readonly vaccineStore: IVaccineStore,
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

    // Validate vaccine exists
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

    // Validate quantity is positive
    if (data.quantity <= 0) {
      throw new InvalidBatchQuantityError(
        'Quantity must be a positive integer',
      );
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

      receivedDate: data.receivedDate ? data.receivedDate : getCurrentDate(),
      status: 'AVAILABLE',
      vaccine: {
        connect: { id: data.vaccineId },
      },
      createdBy: {
        connect: { id: userId },
      },
    });

    // Update vaccine's totalStock
    // Increment the totalStock by the quantity of the new batch
    await this.vaccineStore.update(data.vaccineId, {
      totalStock: {
        increment: data.quantity,
      },
      updatedAt: getCurrentDate(),
    });

    return newBatch;
  }

  async findVaccineBatchs(vaccineId: string): Promise<VaccineBatch[]> {
    return this.vaccineBatchStore.findByVaccineId(vaccineId);
  }

  async deleteVaccineBatch(batchId: string): Promise<void> {
    await this.vaccineBatchStore.delete(batchId);
  }
}
