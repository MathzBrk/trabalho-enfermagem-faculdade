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

// Store input types (independent of Prisma implementation)
export interface VaccineApplicationCreateInput {
  applicationDate: Date;
  doseNumber: number;
  applicationSite: string;
  observations?: string;
  receivedById: string;    // Simple ID, not Prisma connect
  vaccineId: string;       // Simple ID, not Prisma connect
  batchId: string;         // Simple ID, not Prisma connect
  appliedById: string;     // Simple ID, not Prisma connect
  schedulingId?: string;   // Simple ID, not Prisma connect
}

export interface VaccineApplicationUpdateInput {
  applicationSite?: string;
  observations?: string;
  deletedAt?: Date;
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
export type VaccineApplicationDelegate = Prisma.VaccineApplicationDelegate;
