import type { Vaccine, VaccineScheduling } from '@infrastructure/database';
import type { Prisma } from '@infrastructure/database/generated/prisma';
import {
  InsufficientStockError,
  VaccineNotFoundError,
} from '@modules/vaccines/errors';
import { buildPaginationArgs } from '@shared/helpers/prismaHelper';
import { getEndOfDay, getStartOfDay } from '@shared/helpers/timeHelper';
import type {
  PaginatedResponse,
  PaginationParams,
} from '@shared/interfaces/pagination';
import { calculatePaginationMetadata } from '@shared/interfaces/pagination';
import type {
  IVaccineSchedulingStore,
  VaccineSchedulingFilterParams,
} from '@shared/interfaces/vaccineScheduling';
import type {
  VaccineSchedulingCreateInput,
  VaccineSchedulingDelegate,
  VaccineSchedulingUpdateInput,
  VaccineSchedulingWithRelations,
} from '@shared/models/vaccineScheduling';
import { BaseStore } from '@shared/stores/baseStore';
import { injectable } from 'tsyringe';
import { allowedVaccineSchedulingSortFields } from '../constants';

@injectable()
export class VaccineSchedulingStore
  extends BaseStore<
    VaccineScheduling,
    VaccineSchedulingDelegate,
    VaccineSchedulingCreateInput,
    VaccineSchedulingUpdateInput
  >
  implements IVaccineSchedulingStore
{
  protected readonly model = this.prisma.vaccineScheduling;

  /**
   * Creates a new vaccine scheduling
   * Converts our store input format to Prisma format
   */
  async create(data: VaccineSchedulingCreateInput): Promise<VaccineScheduling> {
    return this.model.create({
      data: {
        scheduledDate: data.scheduledDate,
        doseNumber: data.doseNumber,
        notes: data.notes,
        status: (data.status || 'SCHEDULED') as any,
        user: {
          connect: { id: data.userId },
        },
        vaccine: {
          connect: { id: data.vaccineId },
        },
      },
    });
  }

  async findByVaccineId(vaccineId: string): Promise<VaccineScheduling[]> {
    return this.model.findMany({
      where: {
        vaccineId,
        deletedAt: null,
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async getSchedulingsByDate(
    userId: string,
    date: Date,
  ): Promise<VaccineSchedulingWithRelations[]> {
    const start = getStartOfDay(date);
    const end = getEndOfDay(date);
    return this.model.findMany({
      where: {
        scheduledDate: {
          gte: start,
          lte: end,
        },
        assignedNurseId: userId,
        deletedAt: null,
      },
      include: {
        user: {
          omit: {
            password: true,
          },
        },
        vaccine: true,
        assignedNurse: true,
        application: true,
      },
    });
  }

  /**
   * Updates a vaccine scheduling
   * Converts our store input format to Prisma format
   */
  async update(
    id: string,
    data: VaccineSchedulingUpdateInput,
  ): Promise<VaccineScheduling> {
    return this.model.update({
      where: { id },
      data: {
        scheduledDate: data.scheduledDate,
        notes: data.notes,
        status: data.status as any,
        deletedAt: data.deletedAt,
        assignedNurseId: data.nurseId,
      },
    });
  }

  /**
   * Finds a scheduling by ID with user and vaccine relations
   */
  async findByIdWithRelations(
    id: string,
  ): Promise<VaccineSchedulingWithRelations | null> {
    return this.model.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        user: {
          omit: {
            password: true,
          },
        },
        vaccine: true,
        assignedNurse: true,
        application: true,
      },
    });
  }

  /**
   * Finds paginated schedulings with filters
   */
  async findPaginatedSchedulings(
    params: PaginationParams,
    filters?: VaccineSchedulingFilterParams,
  ): Promise<PaginatedResponse<VaccineScheduling>> {
    const { page, perPage } = params;

    const where: Prisma.VaccineSchedulingWhereInput = {
      deletedAt: null,
    };

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.vaccineId) {
      where.vaccineId = filters.vaccineId;
    }

    if (filters?.status) {
      where.status = filters.status as any;
    }

    if (filters?.startDate || filters?.endDate) {
      where.scheduledDate = {};
      if (filters.startDate) {
        where.scheduledDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.scheduledDate.lte = filters.endDate;
      }
    }

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        ...buildPaginationArgs(params, allowedVaccineSchedulingSortFields),
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              cpf: true,
              role: true,
            },
          },
          vaccine: {
            select: {
              id: true,
              name: true,
              manufacturer: true,
              dosesRequired: true,
            },
          },
          assignedNurse: {
            select: {
              id: true,
              name: true,
              email: true,
              cpf: true,
              role: true,
            },
          },
        },
      }),
      this.model.count({ where }),
    ]);

    const pagination = calculatePaginationMetadata(page, perPage, total);

    return {
      data,
      pagination,
    };
  }

  /**
   * Checks if a scheduling already exists for a user, vaccine and dose
   */
  async existsByUserVaccineDose(
    userId: string,
    vaccineId: string,
    doseNumber: number,
  ): Promise<boolean> {
    const count = await this.model.count({
      where: {
        userId,
        vaccineId,
        doseNumber,
        deletedAt: null,
        status: {
          in: ['SCHEDULED', 'CONFIRMED', 'COMPLETED'],
        },
      },
    });

    return count > 0;
  }

  /**
   * Finds all active schedulings for a user and vaccine
   */
  async findByUserAndVaccine(
    userId: string,
    vaccineId: string,
  ): Promise<VaccineScheduling[]> {
    return this.model.findMany({
      where: {
        userId,
        vaccineId,
        deletedAt: null,
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  /**
   * Creates a vaccine scheduling with atomic stock validation using pessimistic locking
   *
   * Race Condition Prevention Strategy:
   * This method prevents overbooking by using a pessimistic lock (FOR UPDATE) on the vaccine row.
   * The lock ensures that only one transaction can validate and create a scheduling at a time
   * for a given vaccine, preventing the classic race condition where:
   *   1. Request A checks stock: 1 dose available
   *   2. Request B checks stock: 1 dose available
   *   3. Request A creates scheduling
   *   4. Request B creates scheduling (OVERBOOKING - should have failed!)
   *
   * Implementation Details:
   * 1. Wraps all operations in a database transaction for atomicity
   * 2. Uses SELECT ... FOR UPDATE to acquire an exclusive lock on the vaccine row
   * 3. The lock is held until the transaction commits, preventing other transactions
   *    from reading or modifying the vaccine row
   * 4. Counts reserved doses (SCHEDULED + CONFIRMED status)
   * 5. Validates available stock: totalStock - dosesReserved > 0
   * 6. Creates scheduling only if validation passes
   * 7. Transaction commits, releasing the lock
   *
   * Performance Considerations:
   * - Pessimistic locking can reduce throughput under high concurrency
   * - However, it provides strong consistency guarantees
   * - Lock duration is minimized by keeping transaction scope small
   * - Alternative: Optimistic locking with version fields (requires retry logic)
   *
   * @param data - Vaccine scheduling creation data
   * @param vaccineId - ID of the vaccine to validate stock for
   * @returns Created vaccine scheduling
   * @throws InsufficientStockError if no available doses
   * @throws VaccineNotFoundError if vaccine not found or deleted
   */
  async createSchedulingWithStockValidation(
    data: VaccineSchedulingCreateInput,
    vaccineId: string,
  ): Promise<VaccineScheduling> {
    console.log(
      `Creating scheduling with stock validation for vaccine ID: ${vaccineId}`,
    );
    return this.prisma.$transaction(async (tx) => {
      // Step 1: Lock the vaccine row to prevent concurrent modifications
      // FOR UPDATE acquires an exclusive lock that blocks other transactions
      // from selecting FOR UPDATE or modifying this row until we commit
      const vaccines = await tx.$queryRaw<Vaccine[]>`
        SELECT * FROM vaccines
        WHERE id = ${vaccineId}
        AND "deletedAt" IS NULL
        FOR UPDATE
      `;

      // Step 2: Validate vaccine exists and is not deleted
      const vaccine = vaccines?.[0];

      if (!vaccine) {
        throw new VaccineNotFoundError(
          `Vaccine with ID ${vaccineId} not found`,
        );
      }

      // Step 3: Count reserved doses atomically (still within the transaction)
      // Status IN ['SCHEDULED', 'CONFIRMED'] represents doses that are reserved
      const dosesReserved = await tx.vaccineScheduling.count({
        where: {
          vaccineId,
          deletedAt: null,
          status: {
            in: ['SCHEDULED', 'CONFIRMED'],
          },
        },
      });

      // Step 4: Calculate available doses
      const availableDoses = vaccine.totalStock - dosesReserved;

      // Step 5: Validate stock availability
      if (availableDoses <= 0) {
        throw new InsufficientStockError(
          `No available doses for vaccine ID ${vaccineId}. Total stock: ${vaccine.totalStock}, Reserved: ${dosesReserved}`,
        );
      }

      // Step 6: Create scheduling (stock is guaranteed available due to lock)
      const scheduling = await tx.vaccineScheduling.create({
        data: {
          scheduledDate: data.scheduledDate,
          doseNumber: data.doseNumber,
          notes: data.notes,
          status: (data.status || 'SCHEDULED') as any,
          user: {
            connect: { id: data.userId },
          },
          vaccine: {
            connect: { id: data.vaccineId },
          },
          assignedNurse: data.nurseId
            ? {
                connect: { id: data.nurseId },
              }
            : undefined,
        },
      });

      // Transaction commits here, releasing the lock
      return scheduling;
    });
  }
}
