import type {
  Prisma,
  VaccineScheduling as PrismaVaccineScheduling,
} from '@infrastructure/database';

// DTOs (Data Transfer Objects) for API layer
export interface CreateVaccineSchedulingDTO {
  userId: string;
  vaccineId: string;
  scheduledDate: string;
  doseNumber: number;
  notes?: string;
}

export interface UpdateVaccineSchedulingDTO {
  scheduledDate?: string;
  notes?: string;
  status?: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

// Store input types (independent of Prisma implementation)
export interface VaccineSchedulingCreateInput {
  userId: string;
  vaccineId: string;
  scheduledDate: Date;
  doseNumber: number;
  notes?: string;
  status?: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  assignedNurseId?: string;
}

export interface VaccineSchedulingUpdateInput {
  scheduledDate?: Date;
  notes?: string;
  status?: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  deletedAt?: Date;
}

// Type aliases from Prisma
export type VaccineScheduling = PrismaVaccineScheduling;

export type VaccineSchedulingWithRelations =
  Prisma.VaccineSchedulingGetPayload<{
    include: {
      user: {
        select: {
          id: true;
          name: true;
          email: true;
          cpf: true;
          role: true;
        };
      };
      vaccine: {
        select: {
          id: true;
          name: true;
          manufacturer: true;
          dosesRequired: true;
        };
      };
    };
  }>;

export type VaccineSchedulingDelegate = Prisma.VaccineSchedulingDelegate;
