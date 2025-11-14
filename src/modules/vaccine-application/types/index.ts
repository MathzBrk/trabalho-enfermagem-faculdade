import type { User } from '@shared/models/user';
import type { Vaccine } from '@shared/models/vaccine';
import type { VaccineBatch } from '@shared/models/vaccineBatch';

export interface ValidateApplicationDataParams {
  applicator: Omit<User, 'password'>;
  receiver: Omit<User, 'password'>;
  batch: VaccineBatch;
  vaccine: Vaccine;
  doseNumber: number;
}
