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

export type Vaccine = PrismaVaccine;
export type VaccineCreateInput = Prisma.VaccineCreateInput;
export type VaccineUpdateInput = Prisma.VaccineUpdateInput;
export type VaccineDelegate = Prisma.VaccineDelegate;
