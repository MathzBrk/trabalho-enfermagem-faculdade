import type { VaccineApplication } from '@infrastructure/database';
import type {
  CreateVaccineApplicationDTO,
  VaccineApplicationCreateInput,
  VaccineApplicationUpdateInput,
  VaccineApplicationWithRelations,
} from '@shared/models/vaccineApplication';
import type { IBaseStore } from '@shared/stores/baseStore';
import type { PaginatedResponse, PaginationParams } from './pagination';

export interface VaccineApplicationFilterParams {
  userId?: string;
  vaccineId?: string;
  appliedById?: string;
  batchId?: string;
  doseNumber?: number;
  applicationDateFrom?: Date;
  applicationDateTo?: Date;
}

export interface IVaccineApplicationStore
  extends IBaseStore<
    VaccineApplication,
    VaccineApplicationCreateInput,
    VaccineApplicationUpdateInput
  > {
  createApplicationAndDecrementStock(
    data: CreateVaccineApplicationDTO,
  ): Promise<VaccineApplication>;
  findByUserAndVaccine(
    userId: string,
    vaccineId: string,
  ): Promise<VaccineApplication[]>;
  findByUserId(userId: string): Promise<VaccineApplicationWithRelations[]>;
  findPaginatedApplications(
    params: PaginationParams,
    filters?: VaccineApplicationFilterParams,
  ): Promise<PaginatedResponse<VaccineApplication>>;
  existsByUserVaccineDose(
    userId: string,
    vaccineId: string,
    doseNumber: number,
  ): Promise<boolean>;
  findLatestApplicationForUserVaccine(
    userId: string,
    vaccineId: string,
  ): Promise<VaccineApplication | null>;
}
