import type { Vaccine } from '@infrastructure/database';
import type {
  VaccineCreateInput,
  VaccineUpdateInput,
} from '@shared/models/vaccine';
import type { IBaseStore } from '@shared/stores/baseStore';
import type { PaginatedResponse, PaginationParams } from './pagination';

export interface VaccineFilterParams {
  /** Filter by manufacturer name */
  manufacturer?: string;

  /** Filter by obligatory status */
  isObligatory?: boolean;
}

export interface IVaccineStore
  extends IBaseStore<Vaccine, VaccineCreateInput, VaccineUpdateInput> {
  findById(id: string, includeBatches?: boolean): Promise<Vaccine | null>;
  findByName(name: string): Promise<Vaccine | null>;
  findByNameAndManufacturer(
    name: string,
    manufacturer: string,
  ): Promise<Vaccine | null>;
  findAllByManufacturer(manufacturer: string): Promise<Vaccine[]>;
  findObligatoryVaccines(): Promise<Vaccine[]>;
  findPaginatedVaccines(
    params: PaginationParams,
    filters?: VaccineFilterParams,
  ): Promise<PaginatedResponse<Vaccine>>;
}
