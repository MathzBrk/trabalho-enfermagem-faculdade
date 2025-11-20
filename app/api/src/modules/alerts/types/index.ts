import type { Vaccine } from '@shared/models/vaccine';
import type { VaccineBatch } from '@shared/models/vaccineBatch';

export type AlertPayload =
  | { alertType: 'LOW_STOCK'; objects: Vaccine[] }
  | { alertType: 'EXPIRED_BATCH'; objects: VaccineBatch[] }
  | { alertType: 'NEARING_EXPIRATION_BATCH'; objects: VaccineBatch[] };
