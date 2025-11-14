import type { Prisma, Vaccine } from '@infrastructure/database';
import type {
  PaginatedResponse,
  PaginationParams,
} from '@shared/interfaces/pagination';
import { calculatePaginationMetadata } from '@shared/interfaces/pagination';
import type {
  IVaccineStore,
  VaccineFilterParams,
} from '@shared/interfaces/vaccine';
import type {
  VaccineCreateInput,
  VaccineDelegate,
  VaccineUpdateInput,
} from '@shared/models/vaccine';
import { buildPaginationArgs } from '@shared/helpers/prismaHelper';
import { BaseStore } from '@shared/stores/baseStore';
import { injectable } from 'tsyringe';
import { allowedVaccineSortFields } from '../constants';

/**
 * VaccineStore - Prisma-based implementation of IVaccineStore
 *
 * This is the production implementation that uses Prisma ORM for database operations.
 * Registered as singleton in DI container to maintain connection pooling and caching.
 *
 * Inherits basic CRUD methods from BaseStore:
 * - findById(id)
 * - findAll()
 * - create(data)
 * - update(id, data)
 * - delete(id)
 * - softDelete(id)
 * - count(where?)
 * - exists(where)
 *
 * And adds Vaccine-specific methods
 */

@injectable()
export class VaccineStore
  extends BaseStore<
    Vaccine,
    VaccineDelegate,
    VaccineCreateInput,
    VaccineUpdateInput
  >
  implements IVaccineStore
{
  // Defines the model to be used by the base class
  protected readonly model = this.prisma.vaccine;

  /**
   * Creates a new vaccine
   * Converts our store input format to Prisma format
   */
  async create(data: VaccineCreateInput): Promise<Vaccine> {
    return this.model.create({
      data: {
        name: data.name,
        manufacturer: data.manufacturer,
        description: data.description,
        dosesRequired: data.dosesRequired,
        intervalDays: data.intervalDays,
        isObligatory: data.isObligatory,
        minStockLevel: data.minStockLevel,
        createdBy: {
          connect: { id: data.createdById }, // Store handles Prisma conversion
        },
      },
    });
  }

  /**
   * Finds a vaccine by ID with optional batches inclusion
   *
   * @param id - Vaccine UUID
   * @param includeBatches - Whether to include vaccine batches in the response
   * @returns Vaccine object or null if not found
   *
   * @example
   * // Without batches
   * const vaccine = await vaccineStore.findById('vaccine-id');
   *
   * // With batches
   * const vaccineWithBatches = await vaccineStore.findById('vaccine-id', true);
   */
  async findById(id: string, includeBatches = false): Promise<Vaccine | null> {
    return this.model.findUnique({
      where: { id },
      include: includeBatches
        ? {
            batches: {
              where: { deletedAt: null },
              orderBy: { expirationDate: 'asc' },
            },
          }
        : undefined,
    }) as Promise<Vaccine | null>;
  }

  async findMandatoryVaccinesNotTakenByUser(
    userId: string,
  ): Promise<Vaccine[]> {
    return this.model.findMany({
      where: {
        isObligatory: true,
        deletedAt: null,
        schedulings: { none: { userId } },
      },
    });
  }

  async findPaginatedVaccines(
    params: PaginationParams,
    filters?: VaccineFilterParams,
  ): Promise<PaginatedResponse<Vaccine>> {
    const { page, perPage } = params;

    const where: Prisma.VaccineWhereInput = {};

    if (filters?.manufacturer) {
      where.manufacturer = filters.manufacturer;
    }

    if (filters?.isObligatory !== undefined) {
      where.isObligatory = filters.isObligatory;
    }

    const [total, vaccines] = await Promise.all([
      this.count(where),
      this.model.findMany({
        where,
        ...buildPaginationArgs(params, allowedVaccineSortFields),
      }),
    ]);

    const pagination = calculatePaginationMetadata(page, perPage, total);

    return {
      data: vaccines,
      pagination,
    };
  }

  /**
   * Finds vaccine by name
   *
   * @param name - Vaccine's name
   * @returns Vaccine or null if not found
   */
  async findByName(name: string): Promise<Vaccine | null> {
    return this.model.findFirst({
      where: { name },
    });
  }

  /**
   * Finds vaccine by name and manufacturer (case-insensitive)
   *
   * This method is used to check for duplicate vaccines before creation.
   * The search uses normalized values to ensure case-insensitive comparison.
   * Only returns non-deleted vaccines (deletedAt is null).
   *
   * @param name - Normalized vaccine name (should be pre-normalized by caller)
   * @param manufacturer - Normalized manufacturer name (should be pre-normalized by caller)
   * @returns Vaccine or null if not found
   */
  async findByNameAndManufacturer(
    name: string,
    manufacturer: string,
  ): Promise<Vaccine | null> {
    return this.model.findFirst({
      where: {
        name,
        manufacturer,
        deletedAt: null,
      },
    });
  }

  /**
   * Finds all vaccines by manufacturer
   *
   * @param manufacturer - Manufacturer name
   * @returns Array of vaccines from this manufacturer
   */
  async findAllByManufacturer(manufacturer: string): Promise<Vaccine[]> {
    return this.model.findMany({
      where: { manufacturer },
    });
  }

  /**
   * Finds all obligatory vaccines
   *
   * @returns Array of obligatory vaccines
   */
  async findObligatoryVaccines(): Promise<Vaccine[]> {
    return this.model.findMany({
      where: {
        isObligatory: true,
        deletedAt: null,
      },
    });
  }

  /**
   * Atomically increments the vaccine's total stock
   *
   * Uses Prisma's atomic increment operation to prevent race conditions.
   * This is critical for maintaining data consistency when multiple batch
   * operations occur concurrently (e.g., multiple batches being added simultaneously).
   *
   * The atomic operation is performed at the database level using:
   * UPDATE vaccines SET totalStock = totalStock + amount WHERE id = vaccineId
   *
   * This ensures the increment is thread-safe and prevents lost updates.
   *
   * @param vaccineId - UUID of the vaccine to update
   * @param amount - Positive integer amount to increment
   * @returns Updated vaccine object with new totalStock
   * @throws Error if amount is not positive
   *
   * @example
   * // Adding a new batch of 100 units
   * const vaccine = await vaccineStore.incrementStock('vaccine-id', 100);
   * console.log(vaccine.totalStock); // Previous stock + 100
   */
  async incrementStock(vaccineId: string, amount: number): Promise<Vaccine> {
    if (amount <= 0) {
      throw new Error(`Increment amount must be positive, got ${amount}`);
    }

    return this.model.update({
      where: { id: vaccineId },
      data: {
        totalStock: { increment: amount },
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Atomically decrements the vaccine's total stock
   *
   * Uses Prisma's atomic decrement operation to prevent race conditions.
   * This is critical for maintaining data consistency when batches are removed
   * or stock is consumed concurrently.
   *
   * The atomic operation is performed at the database level using:
   * UPDATE vaccines SET totalStock = totalStock - amount WHERE id = vaccineId
   *
   * Important: This method does NOT prevent negative stock values at the database level.
   * The service layer is responsible for business rule validation (e.g., ensuring
   * stock doesn't go below zero before calling this method).
   *
   * @param vaccineId - UUID of the vaccine to update
   * @param amount - Positive integer amount to decrement
   * @returns Updated vaccine object with new totalStock
   * @throws Error if amount is not positive
   *
   * @example
   * // Removing a batch of 50 units
   * const vaccine = await vaccineStore.decrementStock('vaccine-id', 50);
   * console.log(vaccine.totalStock); // Previous stock - 50
   */
  async decrementStock(vaccineId: string, amount: number): Promise<Vaccine> {
    if (amount <= 0) {
      throw new Error(`Decrement amount must be positive, got ${amount}`);
    }

    return this.model.update({
      where: { id: vaccineId },
      data: {
        totalStock: { decrement: amount },
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Atomically deletes a vaccine and all its associated batches
   *
   * This method uses Prisma's $transaction to ensure all-or-nothing semantics.
   * All operations are executed within a single database transaction, guaranteeing
   * that either all changes succeed or all changes are rolled back.
   *
   * Transaction Steps:
   * 1. Find all AVAILABLE batches with currentQuantity > 0
   * 2. Calculate total stock to remove (sum of currentQuantity)
   * 3. If totalStockToRemove > 0, atomically decrement vaccine.totalStock
   * 4. Delete all batches using deleteMany (efficient bulk delete)
   * 5. Delete the vaccine
   *
   * Design Rationale:
   * - Stock adjustment happens BEFORE deletion for safer operation
   * - Only AVAILABLE batches contribute to stock (business rule enforcement)
   * - Using deleteMany is more efficient than individual deletes
   * - Transaction ensures consistency even if operation is interrupted
   *
   * Why Adjust Stock Before Deletion?
   * - Provides audit trail if transaction fails mid-operation
   * - Ensures stock is correct even during rollback scenarios
   * - Follows principle of "safe state before destructive operation"
   *
   * Performance Considerations:
   * - Single round-trip to database for batch fetch
   * - Bulk delete using deleteMany (more efficient than N deletes)
   * - Transaction isolation prevents concurrent modification issues
   *
   * @param vaccineId - UUID of the vaccine to delete
   * @returns Promise that resolves when deletion is complete
   * @throws Error if vaccine not found
   * @throws Error if transaction fails (all changes are rolled back)
   *
   * @example
   * // Delete vaccine and all batches atomically
   * await vaccineStore.deleteVaccineWithBatches('vaccine-id');
   * // Success: vaccine and all batches deleted, stock adjusted
   * // Failure: nothing deleted, database remains unchanged
   */
  async deleteVaccineWithBatches(vaccineId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Step 1: Find all AVAILABLE batches with quantity > 0
      // Only AVAILABLE batches should affect totalStock
      const availableBatches = await tx.vaccineBatch.findMany({
        where: {
          vaccineId,
          status: 'AVAILABLE',
          currentQuantity: { gt: 0 },
          deletedAt: null,
        },
        select: {
          currentQuantity: true,
        },
      });

      // Step 2: Calculate total stock to remove
      const totalStockToRemove = availableBatches.reduce(
        (sum, batch) => sum + batch.currentQuantity,
        0,
      );

      // Step 3: Adjust vaccine stock BEFORE deletion if needed
      // This ensures stock is correct even during transaction rollback scenarios

      if (totalStockToRemove > 0) {
        await tx.vaccine.update({
          where: { id: vaccineId },
          data: {
            totalStock: { decrement: totalStockToRemove },
            updatedAt: new Date(),
          },
        });
      }

      // Step 4: Delete all batches (efficient bulk delete)
      // This deletes ALL batches (AVAILABLE, EXPIRED, DEPLETED, DISCARDED)
      await tx.vaccineBatch.deleteMany({
        where: { vaccineId },
      });

      // Step 5: Delete the vaccine itself
      await tx.vaccine.delete({
        where: { id: vaccineId },
      });
    });
  }
}
