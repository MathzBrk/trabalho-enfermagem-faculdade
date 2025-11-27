import { TOKENS } from '@infrastructure/di/tokens';
import { ForbiddenError, UserNotFoundError } from '@modules/user/errors';
import type { IUserStore } from '@shared/interfaces/user';
import type { IVaccineStore } from '@shared/interfaces/vaccine';
import type { IVaccineApplicationStore } from '@shared/interfaces/vaccineApplication';
import type {
  VaccinationCoverage,
  VaccineCoverageDetail,
} from '@shared/models/vaccinationCoverage';
import pLimit from 'p-limit';
import { inject, injectable } from 'tsyringe';
import { DEFAULT_COVERAGE_TARGET } from '../constants';
import { InvalidPorcentageError } from '../errors';

@injectable()
export class VaccinationCoverageService {
  private concurrencyLimit = pLimit(10);

  constructor(
    @inject(TOKENS.IVaccineStore)
    private vaccineStore: IVaccineStore,
    @inject(TOKENS.IVaccineApplicationStore)
    private vaccineApplicationStore: IVaccineApplicationStore,
    @inject(TOKENS.IUserStore)
    private userStore: IUserStore,
  ) {}

  async calculateVaccinationCoverage(
    requestingUserId: string,
  ): Promise<VaccinationCoverage> {
    const user = await this.userStore.findById(requestingUserId);

    if (!user) {
      throw new UserNotFoundError(`User with ID ${requestingUserId} not found`);
    }

    if (user.role !== 'MANAGER') {
      throw new ForbiddenError(
        `User with ID ${requestingUserId} does not have permission to access vaccination coverage data`,
      );
    }

    const [vaccines, totalUsers] = await Promise.all([
      this.vaccineStore.findAll(),
      this.userStore.findAllActive(),
    ]);

    const totalActiveUsers = totalUsers.length;

    const details: VaccineCoverageDetail[] = await Promise.all(
      vaccines.map((vaccine) =>
        this.concurrencyLimit(async () => {
          const completeDoses =
            await this.vaccineApplicationStore.countCompletedDosesByVaccine(
              vaccine,
            );

          const partialDoses =
            await this.vaccineApplicationStore.countPartialDosesByVaccine(
              vaccine,
            );

          const coveragePercentage =
            totalActiveUsers > 0 ? (completeDoses / totalActiveUsers) * 100 : 0;

          return {
            vaccineName: vaccine.name,
            isObligatory: vaccine.isObligatory,
            coveragePercentage: Number.parseFloat(
              coveragePercentage.toFixed(2),
            ),
            completeDoses,
            shoudHaveDoses: vaccine.dosesRequired * totalActiveUsers,
            partialDoses,
            status: this.defineVaccineCoverageStatus(coveragePercentage),
          };
        }),
      ),
    );

    if (!details.length) {
      return this.returnEmptyCoverage();
    }

    const criticalVaccines = details
      .filter((detail) => detail.status === 'critical')
      .map((detail) => {
        const gapToTarget = DEFAULT_COVERAGE_TARGET - detail.coveragePercentage;

        return {
          vaccineName: detail.vaccineName,
          coveragePercentage: detail.coveragePercentage,
          gapToTarget: Number.parseFloat(gapToTarget.toFixed(2)),
        };
      });

    const averageCoverage =
      details.reduce((acc, d) => acc + d.coveragePercentage, 0) /
      details.length;

    const obligatoryVaccines = vaccines.filter((v) => v.isObligatory);
    const totalObligatoryVaccines = obligatoryVaccines.length;

    const userVaccinationStatus = await Promise.all(
      totalUsers.map((user) =>
        this.concurrencyLimit(async () => {
          let completedCount = 0;
          let partialCount = 0;

          for (const vaccine of obligatoryVaccines) {
            const applications =
              await this.vaccineApplicationStore.findByUserAndVaccine(
                user.id,
                vaccine.id,
              );

            if (!applications.length) {
              continue;
            }

            const hasCompletedAllDoses = applications.some(
              (app) => app.doseNumber === vaccine.dosesRequired,
            );

            if (hasCompletedAllDoses) {
              completedCount++;
            } else {
              partialCount++;
            }
          }

          if (completedCount === totalObligatoryVaccines) {
            return 'fully';
          }
          if (completedCount > 0 || partialCount > 0) {
            return 'partially';
          }
          return 'not_started';
        }),
      ),
    );

    const fullyVaccinatedUsers = userVaccinationStatus.filter(
      (status) => status === 'fully',
    ).length;
    const partiallyVaccinatedUsers = userVaccinationStatus.filter(
      (status) => status === 'partially',
    ).length;
    const notStartedUsers = userVaccinationStatus.filter(
      (status) => status === 'not_started',
    ).length;

    const completionRate =
      totalActiveUsers > 0
        ? (fullyVaccinatedUsers / totalActiveUsers) * 100
        : 0;

    return {
      summary: {
        averageCoverage: Number.parseFloat(averageCoverage.toFixed(2)),
        targetReached: details.filter(
          (d) => d.status === 'at_target' || d.status === 'above_target',
        ).length,
        criticalVaccines: criticalVaccines.length,
        defaultTargetValue: DEFAULT_COVERAGE_TARGET,
      },
      details,
      criticalVaccines,
      completion: {
        fullyVaccinatedUsers,
        partiallyVaccinatedUsers,
        notStartedUsers,
        completionRate: Number.parseFloat(completionRate.toFixed(2)),
      },
    };
  }

  private defineVaccineCoverageStatus(
    percentage: number,
  ): 'critical' | 'below_target' | 'at_target' | 'above_target' {
    const criticalThreshold = DEFAULT_COVERAGE_TARGET * 0.5;

    if (percentage <= criticalThreshold) {
      return 'critical';
    }

    if (percentage > DEFAULT_COVERAGE_TARGET) {
      return 'above_target';
    }

    if (percentage === DEFAULT_COVERAGE_TARGET) {
      return 'at_target';
    }

    if (percentage < DEFAULT_COVERAGE_TARGET) {
      return 'below_target';
    }

    throw new InvalidPorcentageError(percentage);
  }

  private returnEmptyCoverage(): VaccinationCoverage {
    return {
      summary: {
        averageCoverage: 0,
        targetReached: 0,
        criticalVaccines: 0,
        defaultTargetValue: DEFAULT_COVERAGE_TARGET,
      },
      details: [],
      criticalVaccines: [],
      completion: {
        fullyVaccinatedUsers: 0,
        partiallyVaccinatedUsers: 0,
        notStartedUsers: 0,
        completionRate: 0,
      },
    };
  }
}
