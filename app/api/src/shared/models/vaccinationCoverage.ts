export interface VaccinationCoverage {
  summary: VaccinationSummary;
  details: VaccineCoverageDetail[];
  criticalVaccines: CriticalVaccine[];
  completion: VaccinationCompletion;
}

export interface VaccinationSummary {
  averageCoverage: number;
  targetReached: number;
  criticalVaccines: number;
  defaultTargetValue: number;
}

export interface VaccinationCompletion {
  fullyVaccinatedUsers: number;
  partiallyVaccinatedUsers: number;
  notStartedUsers: number;
  completionRate: number;
}

export interface VaccineCoverageDetail {
  vaccineName: string;
  isObligatory: boolean;
  coveragePercentage: number;
  status: 'critical' | 'below_target' | 'at_target' | 'above_target';
  completeDoses: number;
  partialDoses?: number;
}

export interface CriticalVaccine {
  vaccineName: string;
  coveragePercentage: number;
  gapToTarget: number;
}
