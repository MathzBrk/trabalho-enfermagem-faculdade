import type {
  Prisma,
  VaccineScheduling as PrismaVaccineScheduling,
} from '@infrastructure/database';

// DTOs (Data Transfer Objects) for API layer
export interface CreateVaccineSchedulingDTO {
  nurseId?: string;
  vaccineId: string;
  scheduledDate: string;
  doseNumber: number;
  notes?: string;
}

export interface UpdateVaccineSchedulingDTO {
  scheduledDate?: string;
  nurseId?: string;
  notes?: string;
  status?: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

export interface IntervalDateNurseScheduling {
  year: number;
  month: number;
}

// Store input types (independent of Prisma implementation)
export interface VaccineSchedulingCreateInput {
  userId: string;
  nurseId?: string;
  vaccineId: string;
  scheduledDate: Date;
  doseNumber: number;
  notes?: string;
  status?: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

export interface VaccineSchedulingUpdateInput {
  scheduledDate?: Date;
  nurseId?: string;
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
        omit: {
          password: true;
        };
      };
      vaccine: true;
      assignedNurse: true;
      application: true;
    };
  }>;

export type VaccineSchedulingDelegate = Prisma.VaccineSchedulingDelegate;
