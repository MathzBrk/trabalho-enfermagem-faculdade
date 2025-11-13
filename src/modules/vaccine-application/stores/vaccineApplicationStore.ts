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
  CreateVaccineApplicationDTO,
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
        userId,
        vaccineId,
        deletedAt: null,
      },
      orderBy: { applicationDate: 'desc' },
      include: {
        vaccine: true,
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
   * @param data - Complete vaccine application data including receivedById and appliedById
   * @returns Created vaccine application record
   * @throws Prisma errors if transaction fails (constraint violations, etc.)
   */
  async createApplicationAndDecrementStock(
    data: CreateVaccineApplicationDTO,
  ): Promise<VaccineApplication> {
    return this.prisma.$transaction(async (prisma) => {
      // Step 1: Create vaccine application record
      // Convert to Prisma format (Store handles Prisma conversion)
      const application = await prisma.vaccineApplication.create({
        data: {
          applicationDate: getCurrentDate(),
          doseNumber: data.doseNumber,
          applicationSite: data.applicationSite,
          observations: data.observations,
          user: {
            connect: { id: data.receivedById }, // Store handles Prisma conversion
          },
          vaccine: {
            connect: { id: data.vaccineId }, // Store handles Prisma conversion
          },
          batch: {
            connect: { id: data.batchId }, // Store handles Prisma conversion
          },
          appliedBy: {
            connect: { id: data.appliedById }, // Store handles Prisma conversion
          },
          scheduling: data.schedulingId
            ? {
                connect: { id: data.schedulingId }, // Store handles Prisma conversion
              }
            : undefined,
        },
      });

      // Step 2: Atomically decrement batch quantity
      await prisma.vaccineBatch.update({
        where: { id: data.batchId },
        data: { currentQuantity: { decrement: 1 } },
      });

      // Step 3: Decrement vaccine stock
      await prisma.vaccine.update({
        where: { id: data.vaccineId },
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
        userId,
        deletedAt: null,
      },
      orderBy: { applicationDate: 'desc' },
      include: {
        vaccine: true,
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

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.vaccineId) {
      where.vaccineId = filters.vaccineId;
    }

    if (filters?.appliedById) {
      where.appliedById = filters.appliedById;
    }

    if (filters?.batchId) {
      where.batchId = filters.batchId;
    }

    if (filters?.doseNumber !== undefined) {
      where.doseNumber = filters.doseNumber;
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
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          vaccine: true,
          batch: true,
          appliedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          scheduling: true,
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
      },
    });

    return count > 0;
  }

  /**
   * Find the latest application for a user and vaccine
   */
  async findLatestApplicationForUserVaccine(
    userId: string,
    vaccineId: string,
  ): Promise<VaccineApplication | null> {
    return this.model.findFirst({
      where: {
        userId,
        vaccineId,
        deletedAt: null,
      },
      orderBy: {
        applicationDate: 'desc',
      },
    });
  }
}
