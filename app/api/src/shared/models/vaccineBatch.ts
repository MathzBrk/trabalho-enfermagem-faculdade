import type {
  Prisma,
  VaccineBatch as PrismaVaccineBatch,
} from '@infrastructure/database';

// Store input types (independent of Prisma implementation)
export interface VaccineBatchCreateInput {
  batchNumber: string;
  initialQuantity: number;
  currentQuantity: number;
  expirationDate: Date;
  receivedDate: Date;
  status: string;
  vaccineId: string;     // Simple ID, not Prisma connect
  createdById: string;   // Simple ID, not Prisma connect
}

export interface VaccineBatchUpdateInput {
  batchNumber?: string;
  initialQuantity?: number;
  currentQuantity?: number;
  expirationDate?: Date;
  receivedDate?: Date;
  status?: string;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type VaccineBatch = PrismaVaccineBatch;
export type VaccineBatchDelegate = Prisma.VaccineBatchDelegate;

export type VaccineBatchStatus =
  | 'AVAILABLE'
  | 'EXPIRED'
  | 'DEPLETED'
  | 'DISCARDED';

export interface CreateVaccineBatchDTO {
  vaccineId: string;
  batchNumber: string;
  quantity: number;
  expirationDate: Date;
  receivedDate?: Date;
}

export interface UpdateVaccineBatchDTO {
  batchNumber?: string;
  quantity?: number;
  expirationDate?: Date;
  receivedDate?: Date;
  status?: VaccineBatchStatus;
}
