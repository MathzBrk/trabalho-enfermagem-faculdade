import type { Vaccine } from '@infrastructure/database';
import type {
  VaccineCreateInput,
  VaccineUpdateInput,
} from '@shared/models/vaccine';
import type { IBaseStore } from '@shared/stores/baseStore';

export interface IVaccineStore
  extends IBaseStore<Vaccine, VaccineCreateInput, VaccineUpdateInput> {
  findByName(name: string): Promise<Vaccine | null>;
  findByNameAndManufacturer(
    name: string,
    manufacturer: string,
  ): Promise<Vaccine | null>;
  findAllByManufacturer(manufacturer: string): Promise<Vaccine[]>;
  findObligatoryVaccines(): Promise<Vaccine[]>;
}
