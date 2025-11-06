import type {
  Prisma,
  VaccineBatch as PrismaVaccineBatch,
} from '@infrastructure/database';

export type VaccineBatch = PrismaVaccineBatch;
export type VaccineBatchCreateInput = Prisma.VaccineBatchCreateInput;
export type VaccineBatchUpdateInput = Prisma.VaccineBatchUpdateInput;
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
