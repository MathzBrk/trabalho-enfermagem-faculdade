import type {
  Prisma,
  VaccineBatch,
  BatchStatus,
} from '@infrastructure/database';
import type {
  PaginatedResponse,
  PaginationParams,
} from '@shared/interfaces/pagination';
import { calculatePaginationMetadata } from '@shared/interfaces/pagination';
import type {
  IVaccineBatchStore,
  VaccineBatchFilterParams,
  VaccineBatchStatistics,
} from '@shared/interfaces/vaccineBatch';
import type {
  VaccineBatchCreateInput,
  VaccineBatchDelegate,
  VaccineBatchUpdateInput,
} from '@shared/models/vaccineBatch';
import { buildPaginationArgs } from '@shared/helpers/prismaHelper';
import { BaseStore } from '@shared/stores/baseStore';
import { injectable } from 'tsyringe';
import { allowedVaccineBatchSortFields } from '../constants';

/**
 * VaccineBatchStore - Prisma-based implementation of IVaccineBatchStore
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
 * And adds VaccineBatch-specific methods for stock management, expiration tracking, and reporting.
 */

@injectable()
export class VaccineBatchStore
  extends BaseStore<
    VaccineBatch,
    VaccineBatchDelegate,
    VaccineBatchCreateInput,
    VaccineBatchUpdateInput
  >
  implements IVaccineBatchStore
{
  // Defines the model to be used by the base class
  protected readonly model = this.prisma.vaccineBatch;

  /**
   * Creates a new vaccine batch
   * Converts our store input format to Prisma format
   */
  async create(data: VaccineBatchCreateInput): Promise<VaccineBatch> {
    return this.model.create({
      data: {
        batchNumber: data.batchNumber,
        initialQuantity: data.initialQuantity,
        currentQuantity: data.currentQuantity,
        expirationDate: data.expirationDate,
        receivedDate: data.receivedDate,
        status: data.status as any,
        vaccine: {
          connect: { id: data.vaccineId },  // Store handles Prisma conversion
        },
        createdBy: {
          connect: { id: data.createdById },  // Store handles Prisma conversion
        },
      },
    });
  }

  /**
   * Finds a vaccine batch by batch number
   */
  async findByBatchNumber(batchNumber: string): Promise<VaccineBatch | null> {
    return this.model.findFirst({
      where: {
        batchNumber,
        deletedAt: null,
      },
    });
  }

  /**
   * Finds paginated vaccine batches with optional filtering and sorting
   */
  async findPaginatedBatches(
    params: PaginationParams,
    filters?: VaccineBatchFilterParams,
  ): Promise<PaginatedResponse<VaccineBatch>> {
    const { page, perPage } = params;

    const where: Prisma.VaccineBatchWhereInput = {
      deletedAt: filters?.includeDeleted ? undefined : null,
    };

    if (filters?.vaccineId) {
      where.vaccineId = filters.vaccineId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.expiringBefore || filters?.expiringAfter) {
      const expirationFilter: Prisma.DateTimeFilter = {};
      if (filters.expiringBefore) expirationFilter.lte = filters.expiringBefore;
      if (filters.expiringAfter) expirationFilter.gte = filters.expiringAfter;
      where.expirationDate = expirationFilter;
    }

    if (filters?.minQuantity !== undefined) {
      where.currentQuantity = {
        gte: filters.minQuantity,
      };
    }

    const [total, batches] = await Promise.all([
      this.count(where),
      this.model.findMany({
        where,
        ...buildPaginationArgs(params, allowedVaccineBatchSortFields),
        include: {
          vaccine: false,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const pagination = calculatePaginationMetadata(page, perPage, total);

    return {
      data: batches,
      pagination,
    };
  }

  /**
   * Decrements the current quantity of a batch
   * Automatically updates status to DEPLETED if quantity reaches 0
   */
  async decrementQuantity(id: string, quantity: number): Promise<VaccineBatch> {
    const batch = await this.findById(id);
    if (!batch) {
      throw new Error(`Vaccine batch with id ${id} not found`);
    }

    const newQuantity = batch.currentQuantity - quantity;
    if (newQuantity < 0) {
      throw new Error(
        `Insufficient quantity. Available: ${batch.currentQuantity}, Requested: ${quantity}`,
      );
    }

    return this.model.update({
      where: { id },
      data: {
        currentQuantity: newQuantity,
        status: newQuantity === 0 ? 'DEPLETED' : batch.status,
      },
    });
  }

  /**
   * Increments the current quantity of a batch
   * Updates status to AVAILABLE if was DEPLETED
   */
  async incrementQuantity(id: string, quantity: number): Promise<VaccineBatch> {
    const batch = await this.findById(id);
    if (!batch) {
      throw new Error(`Vaccine batch with id ${id} not found`);
    }

    const newQuantity = batch.currentQuantity + quantity;

    return this.model.update({
      where: { id },
      data: {
        currentQuantity: newQuantity,
        status: batch.status === 'DEPLETED' ? 'AVAILABLE' : batch.status,
      },
    });
  }

  /**
   * Gets the current available quantity for a batch
   */
  async getCurrentQuantity(id: string): Promise<number | null> {
    const batch = await this.model.findUnique({
      where: { id },
      select: { currentQuantity: true },
    });

    return batch?.currentQuantity ?? null;
  }

  /**
   * Checks if a batch has sufficient quantity available
   */
  async hasAvailableQuantity(
    id: string,
    requiredQuantity: number,
  ): Promise<boolean> {
    const quantity = await this.getCurrentQuantity(id);
    if (quantity === null) return false;
    return quantity >= requiredQuantity;
  }

  /**
   * Finds all batches that have expired (expiration date < now)
   * but status is still AVAILABLE
   */
  async findExpiredBatches(): Promise<VaccineBatch[]> {
    return this.model.findMany({
      where: {
        expirationDate: {
          lt: new Date(),
        },
        status: 'AVAILABLE',
        deletedAt: null,
      },
    });
  }

  /**
   * Finds batches expiring within a specified number of days
   */
  async findBatchesExpiringSoon(days: number): Promise<VaccineBatch[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.model.findMany({
      where: {
        expirationDate: {
          gte: new Date(),
          lte: futureDate,
        },
        status: 'AVAILABLE',
        deletedAt: null,
      },
      orderBy: {
        expirationDate: 'asc',
      },
      include: {
        vaccine: true,
      },
    });
  }

  /**
   * Marks a batch as expired
   */
  async markAsExpired(id: string): Promise<VaccineBatch> {
    return this.model.update({
      where: { id },
      data: {
        status: 'EXPIRED',
      },
    });
  }

  /**
   * Marks multiple batches as expired in a single transaction
   */
  async markMultipleAsExpired(ids: string[]): Promise<number> {
    const result = await this.model.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        status: 'EXPIRED',
      },
    });

    return result.count;
  }

  /**
   * Checks if a batch is expired
   */
  async isExpired(id: string): Promise<boolean> {
    const batch = await this.model.findUnique({
      where: { id },
      select: { expirationDate: true },
    });

    if (!batch) return false;
    return batch.expirationDate < new Date();
  }

  /**
   * Finds all batches for a specific vaccine
   */
  async findByVaccineId(
    vaccineId: string,
    includeDeleted?: boolean,
  ): Promise<VaccineBatch[]> {
    return this.model.findMany({
      where: {
        vaccineId,
        deletedAt: includeDeleted ? undefined : null,
      },
      orderBy: {
        expirationDate: 'asc',
      },
    });
  }

  /**
   * Finds batches by status
   */
  async findByStatus(status: BatchStatus): Promise<VaccineBatch[]> {
    return this.model.findMany({
      where: {
        status,
        deletedAt: null,
      },
      include: {
        vaccine: true,
      },
    });
  }

  /**
   * Finds the oldest batch for a vaccine that is still AVAILABLE
   * Implements FIFO (First In, First Out) strategy
   */
  async findOldestAvailableBatch(
    vaccineId: string,
  ): Promise<VaccineBatch | null> {
    return this.model.findFirst({
      where: {
        vaccineId,
        status: 'AVAILABLE',
        currentQuantity: {
          gt: 0,
        },
        deletedAt: null,
      },
      orderBy: {
        receivedDate: 'asc',
      },
    });
  }

  /**
   * Finds the batch closest to expiration for a vaccine that is still AVAILABLE
   * Implements FEFO (First Expired, First Out) strategy
   */
  async findBatchClosestToExpiration(
    vaccineId: string,
  ): Promise<VaccineBatch | null> {
    return this.model.findFirst({
      where: {
        vaccineId,
        status: 'AVAILABLE',
        currentQuantity: {
          gt: 0,
        },
        expirationDate: {
          gte: new Date(),
        },
        deletedAt: null,
      },
      orderBy: {
        expirationDate: 'asc',
      },
    });
  }

  /**
   * Checks if a batch number already exists
   */
  async batchNumberExists(batchNumber: string): Promise<boolean> {
    const count = await this.model.count({
      where: {
        batchNumber,
        deletedAt: null,
      },
    });

    return count > 0;
  }

  /**
   * Gets comprehensive statistics for vaccine batches
   */
  async getStatistics(vaccineId?: string): Promise<VaccineBatchStatistics> {
    const where: Prisma.VaccineBatchWhereInput = {
      deletedAt: null,
    };

    if (vaccineId) {
      where.vaccineId = vaccineId;
    }

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const [
      totalBatches,
      availableBatches,
      expiredBatches,
      depletedBatches,
      discardedBatches,
      batchesExpiringSoon,
      availableQuantityResult,
    ] = await Promise.all([
      this.count(where),
      this.count({ ...where, status: 'AVAILABLE' }),
      this.count({ ...where, status: 'EXPIRED' }),
      this.count({ ...where, status: 'DEPLETED' }),
      this.count({ ...where, status: 'DISCARDED' }),
      this.count({
        ...where,
        expirationDate: {
          gte: new Date(),
          lte: futureDate,
        },
        status: 'AVAILABLE',
      }),
      this.model.aggregate({
        where: {
          ...where,
          status: 'AVAILABLE',
        },
        _sum: {
          currentQuantity: true,
        },
      }),
    ]);

    return {
      totalBatches,
      totalQuantityAvailable: availableQuantityResult._sum.currentQuantity ?? 0,
      availableBatches,
      expiredBatches,
      depletedBatches,
      discardedBatches,
      batchesExpiringSoon,
    };
  }

  /**
   * Gets total available quantity across all batches for a vaccine
   */
  async getTotalAvailableQuantity(vaccineId: string): Promise<number> {
    const result = await this.model.aggregate({
      where: {
        vaccineId,
        status: 'AVAILABLE',
        deletedAt: null,
      },
      _sum: {
        currentQuantity: true,
      },
    });

    return result._sum.currentQuantity ?? 0;
  }

  /**
   * Gets list of batches with low stock (below a threshold)
   */
  async findLowStockBatches(threshold: number): Promise<VaccineBatch[]> {
    return this.model.findMany({
      where: {
        currentQuantity: {
          gt: 0,
          lte: threshold,
        },
        status: 'AVAILABLE',
        deletedAt: null,
      },
      orderBy: {
        currentQuantity: 'asc',
      },
      include: {
        vaccine: true,
      },
    });
  }
}
