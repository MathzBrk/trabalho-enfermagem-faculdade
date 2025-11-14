import type { VaccineApplication } from '@infrastructure/database';
import type { Prisma } from '@infrastructure/database/generated/prisma';
import {
  type PaginatedResponse,
  type PaginationParams,
  calculatePaginationMetadata,
} from '@shared/interfaces/pagination';
import type {
  IVaccineApplicationStore,
  VaccineApplicationFilterParams,
} from '@shared/interfaces/vaccineApplication';
import type {
  VaccineApplicationCreateInput,
  VaccineApplicationDelegate,
  VaccineApplicationUpdateInput,
  VaccineApplicationWithRelations,
} from '@shared/models/vaccineApplication';
import { BaseStore } from '@shared/stores/baseStore';
import { buildPaginationArgs } from '@shared/helpers/prismaHelper';
import { allowedVaccineApplicationSortFields } from '../constants';
import { injectable } from 'tsyringe';
import { getCurrentDate } from '@shared/helpers/timeHelper';

@injectable()
export class VaccineApplicationStore
  extends BaseStore<
    VaccineApplication,
    VaccineApplicationDelegate,
    VaccineApplicationCreateInput,
    VaccineApplicationUpdateInput
  >
  implements IVaccineApplicationStore
{
  protected readonly model = this.prisma.vaccineApplication;

  /**
   * Find all applications for a user and specific vaccine
   */
  async findByUserAndVaccine(
    userId: string,
    vaccineId: string,
  ): Promise<VaccineApplication[]> {
    return this.model.findMany({
      where: {
        scheduling: {
          userId,
          vaccineId,
        },
        deletedAt: null,
      },
      orderBy: { applicationDate: 'desc' },
      include: {
        scheduling: {
          include: {
            user: true,
            vaccine: true,
          },
        },
        batch: true,
        appliedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Find application by scheduling ID
   * Used to check if scheduling already has an application
   */
  async findBySchedulingId(
    schedulingId: string,
  ): Promise<VaccineApplication | null> {
    return this.model.findUnique({
      where: { schedulingId },
      include: {
        scheduling: {
          include: {
            user: true,
            vaccine: true,
          },
        },
        batch: true,
        appliedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            coren: true,
          },
        },
      },
    });
  }

  /**
   * Creates a vaccine application and decrements both batch and vaccine stock atomically
   *
   * This method encapsulates a critical business operation in a database transaction
   * to ensure application creation, batch stock decrement, and vaccine stock decrement
   * all succeed or fail together.
   *
   * Transaction ensures:
   * - Atomicity: All three operations complete or none do
   * - Consistency: Both batch.currentQuantity and vaccine.totalStock are updated
   * - Isolation: Concurrent operations don't interfere
   *
   * @param data - Vaccine application data (schedulingId is required)
   * @returns Created vaccine application record
   * @throws Prisma errors if transaction fails (constraint violations, etc.)
   */
  async createApplicationAndDecrementStock(data: {
    schedulingId: string;
    appliedById: string;
    batchId: string;
    applicationSite: string;
    observations?: string;
  }): Promise<VaccineApplication> {
    return this.prisma.$transaction(async (prisma) => {
      // Step 1: Fetch scheduling to get vaccineId for stock decrement
      const scheduling = await prisma.vaccineScheduling.findUnique({
        where: { id: data.schedulingId },
        select: { vaccineId: true },
      });

      if (!scheduling) {
        throw new Error('Scheduling not found');
      }

      // Step 2: Create vaccine application record
      const application = await prisma.vaccineApplication.create({
        data: {
          applicationDate: getCurrentDate(),
          applicationSite: data.applicationSite,
          observations: data.observations,
          scheduling: {
            connect: { id: data.schedulingId },
          },
          batch: {
            connect: { id: data.batchId },
          },
          appliedBy: {
            connect: { id: data.appliedById },
          },
        },
      });

      // Step 3: Atomically decrement batch quantity
      await prisma.vaccineBatch.update({
        where: { id: data.batchId },
        data: { currentQuantity: { decrement: 1 } },
      });

      // Step 4: Decrement vaccine stock (using vaccineId from scheduling)
      await prisma.vaccine.update({
        where: { id: scheduling.vaccineId },
        data: { totalStock: { decrement: 1 } },
      });

      return application;
    });
  }

  /**
   * Find all applications for a user
   */
  async findByUserId(
    userId: string,
  ): Promise<VaccineApplicationWithRelations[]> {
    return this.model.findMany({
      where: {
        scheduling: {
          userId,
        },
        deletedAt: null,
      },
      orderBy: { applicationDate: 'desc' },
      include: {
        scheduling: {
          include: {
            user: true,
            vaccine: true,
          },
        },
        batch: {
          select: {
            batchNumber: true,
            expirationDate: true,
          },
        },
        appliedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            coren: true,
          },
        },
      },
    });
  }

  /**
   * Find paginated applications with filters
   */
  async findPaginatedApplications(
    params: PaginationParams,
    filters?: VaccineApplicationFilterParams,
  ): Promise<PaginatedResponse<VaccineApplication>> {
    const { page, perPage } = params;

    const where: Prisma.VaccineApplicationWhereInput = {
      deletedAt: null,
    };

    if (
      filters?.userId ||
      filters?.vaccineId ||
      filters?.doseNumber !== undefined
    ) {
      where.scheduling = {};
      if (filters?.userId) {
        where.scheduling.userId = filters.userId;
      }
      if (filters?.vaccineId) {
        where.scheduling.vaccineId = filters.vaccineId;
      }
      if (filters?.doseNumber !== undefined) {
        where.scheduling.doseNumber = filters.doseNumber;
      }
    }

    if (filters?.appliedById) {
      where.appliedById = filters.appliedById;
    }

    if (filters?.batchId) {
      where.batchId = filters.batchId;
    }

    if (filters?.applicationDateFrom || filters?.applicationDateTo) {
      where.applicationDate = {};
      if (filters.applicationDateFrom) {
        where.applicationDate.gte = filters.applicationDateFrom;
      }
      if (filters.applicationDateTo) {
        where.applicationDate.lte = filters.applicationDateTo;
      }
    }

    const [data, total] = await Promise.all([
      this.model.findMany({
        where: where ? where : undefined,
        ...buildPaginationArgs(params, allowedVaccineApplicationSortFields),
        include: {
          scheduling: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              vaccine: true,
            },
          },
          batch: true,
          appliedBy: {
            select: {
              id: true,
              name: true,
              email: true,
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
   * Check if a user already received a specific dose of a vaccine
   * Note: This method now queries via scheduling relation
   */
  async existsByUserVaccineDose(
    userId: string,
    vaccineId: string,
    doseNumber: number,
  ): Promise<boolean> {
    const count = await this.model.count({
      where: {
        scheduling: {
          userId,
          vaccineId,
          doseNumber,
        },
        deletedAt: null,
      },
    });

    return count > 0;
  }

  /**
   * Find the latest application for a user and vaccine
   * Note: This method now queries via scheduling relation
   */
  async findLatestApplicationForUserVaccine(
    userId: string,
    vaccineId: string,
  ): Promise<VaccineApplication | null> {
    return this.model.findFirst({
      where: {
        scheduling: {
          userId,
          vaccineId,
        },
        deletedAt: null,
      },
      orderBy: {
        applicationDate: 'desc',
      },
      include: {
        scheduling: {
          include: {
            user: true,
            vaccine: true,
          },
        },
      },
    });
  }
}
