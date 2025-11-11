import type {
  Prisma,
  VaccineApplication as PrismaVaccineApplication,
} from '@infrastructure/database';

export interface CreateVaccineApplicationDTO {
  receivedById: string;
  vaccineId: string;
  batchId: string;
  appliedById: string;
  doseNumber: number;
  applicationSite: string;
  observations?: string;
  schedulingId?: string;
}

export interface UpdateVaccineApplicationDTO {
  applicationSite?: string;
  observations?: string;
}

export type VaccineApplication = PrismaVaccineApplication;
export type VaccineApplicationWithRelations =
  Prisma.VaccineApplicationGetPayload<{
    include: {
      vaccine: true;
      batch: {
        select: {
          batchNumber: true;
          expirationDate: true;
        };
      };
      appliedBy: {
        select: {
          id: true;
          name: true;
          coren: true;
          email: true;
        };
      };
    };
  }>;
export type VaccineApplicationCreateInput =
  Prisma.VaccineApplicationCreateInput;
export type VaccineApplicationUpdateInput =
  Prisma.VaccineApplicationUpdateInput;
export type VaccineApplicationDelegate = Prisma.VaccineApplicationDelegate;
