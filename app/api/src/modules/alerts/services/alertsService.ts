import { TOKENS } from '@infrastructure/di/tokens';
import type { UserService } from '@modules/user';
import { getVaccinesWithLowStock } from '@shared/helpers/cronJobHelper';
import {
  MILLISECONDS_IN_A_DAY,
  getCurrentDate,
} from '@shared/helpers/timeHelper';
import type { IVaccineStore } from '@shared/interfaces/vaccine';
import type { IVaccineBatchStore } from '@shared/interfaces/vaccineBatch';
import { inject, injectable } from 'tsyringe';
import type { AlertPayload } from '../types';

@injectable()
export class AlertsService {
  constructor(
    @inject(TOKENS.IVaccineStore)
    private readonly vaccineStore: IVaccineStore,
    @inject(TOKENS.IVaccineBatchStore)
    private readonly vaccineBatchStore: IVaccineBatchStore,
    @inject(TOKENS.UserService)
    private readonly userService: UserService,
  ) {}

  async getAllAlertsForManager(
    requestingUserId: string,
  ): Promise<AlertPayload[]> {
    const user = await this.userService.getUserAndValidateRequestingRoles(
      requestingUserId,
      ['MANAGER'],
      'getAllAlertsForManager',
    );

    console.log(`Fetching alerts for manager: ${user.id}`);

    const vaccinesWithLowStock = await getVaccinesWithLowStock({
      vaccineStore: this.vaccineStore,
    });

    const allBatches = await this.vaccineBatchStore.findAll();

    const currentDate = getCurrentDate();

    const expiredBatches = allBatches.filter(
      (batch) => batch.expirationDate < currentDate,
    );

    const batchesNearingExpiration = allBatches.filter((batch) => {
      const timeDiff = batch.expirationDate.getTime() - currentDate.getTime();
      const daysDiff = timeDiff / MILLISECONDS_IN_A_DAY;
      return daysDiff > 0 && daysDiff <= 30;
    });

    const response: AlertPayload[] = [
      {
        alertType: 'LOW_STOCK',
        objects: vaccinesWithLowStock,
      },
      {
        alertType: 'EXPIRED_BATCH',
        objects: expiredBatches,
      },
      {
        alertType: 'NEARING_EXPIRATION_BATCH',
        objects: batchesNearingExpiration,
      },
    ];

    return response;
  }
}
