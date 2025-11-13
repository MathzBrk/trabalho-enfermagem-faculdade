import type { VaccineScheduling } from '@infrastructure/database';
import type { Prisma } from '@infrastructure/database/generated/prisma';
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
import type {
  PaginatedResponse,
  PaginationParams,
} from '@shared/interfaces/pagination';
import { calculatePaginationMetadata } from '@shared/interfaces/pagination';
import { BaseStore } from '@shared/stores/baseStore';
import { buildPaginationArgs } from '@shared/helpers/prismaHelper';
import { allowedVaccineSchedulingSortFields } from '../constants';
import { injectable } from 'tsyringe';

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
}
