import type { VaccineScheduling } from '@infrastructure/database';
import type {
  VaccineSchedulingCreateInput,
  VaccineSchedulingUpdateInput,
  VaccineSchedulingWithRelations,
} from '@shared/models/vaccineScheduling';
import type { IBaseStore } from '@shared/stores/baseStore';
import type { PaginatedResponse, PaginationParams } from './pagination';

// Filter parameters for vaccine scheduling queries
export interface VaccineSchedulingFilterParams {
  userId?: string;
  vaccineId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

// Store interface extending IBaseStore
export interface IVaccineSchedulingStore
  extends IBaseStore<
    VaccineScheduling,
    VaccineSchedulingCreateInput,
    VaccineSchedulingUpdateInput
  > {
  findByIdWithRelations(
    id: string,
  ): Promise<VaccineSchedulingWithRelations | null>;
  findPaginatedSchedulings(
    params: PaginationParams,
    filters?: VaccineSchedulingFilterParams,
  ): Promise<PaginatedResponse<VaccineScheduling>>;
  existsByUserVaccineDose(
    userId: string,
    vaccineId: string,
    doseNumber: number,
  ): Promise<boolean>;
  findByUserAndVaccine(
    userId: string,
    vaccineId: string,
  ): Promise<VaccineScheduling[]>;
  findByVaccineId(vaccineId: string): Promise<VaccineScheduling[]>;
}
