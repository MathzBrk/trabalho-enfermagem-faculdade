import type {
  Prisma,
  Vaccine as PrismaVaccine,
} from '@infrastructure/database';

export interface CreateVaccineDTO {
  name: string;
  manufacturer: string;
  description?: string;
  dosesRequired: number;
  intervalDays?: number;
  isObligatory: boolean;
  minStockLevel?: number;
  createdById?: string; // Injected by service layer
}

export interface UpdateVaccineDTO {
  name?: string;
  manufacturer?: string;
  description?: string;
  dosesRequired?: number;
  intervalDays?: number;
  isObligatory?: boolean;
  minStockLevel?: number;
}

// Store input types (independent of Prisma implementation)
export interface VaccineCreateInput {
  name: string;
  manufacturer: string;
  description?: string;
  dosesRequired: number;
  intervalDays?: number;
  isObligatory: boolean;
  minStockLevel?: number;
  createdById: string;  // Simple ID, not Prisma connect
}

export interface VaccineUpdateInput {
  name?: string;
  manufacturer?: string;
  description?: string;
  dosesRequired?: number;
  intervalDays?: number;
  isObligatory?: boolean;
  minStockLevel?: number;
  deletedAt?: Date;
}

export type Vaccine = PrismaVaccine;
export type VaccineDelegate = Prisma.VaccineDelegate;
