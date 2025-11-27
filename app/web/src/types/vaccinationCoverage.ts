/**
 * Vaccination Coverage Types
 *
 * Type definitions for the vaccination coverage API endpoint.
 * Used by managers to monitor vaccination rates and compliance across the organization.
 */

/**
 * Status indicator for vaccine coverage
 */
export type VaccineCoverageStatus =
  | 'critical'
  | 'below_target'
  | 'at_target'
  | 'above_target';

/**
 * Summary statistics for overall vaccination coverage
 */
export interface VaccinationSummary {
  /** Average coverage percentage across all vaccines */
  averageCoverage: number;
  /** Number of vaccines that have reached the target */
  targetReached: number;
  /** Number of vaccines in critical status */
  criticalVaccines: number;
  /** Default target percentage for vaccination coverage */
  defaultTargetValue: number;
}

/**
 * Detailed coverage information for a single vaccine
 */
export interface VaccineCoverageDetail {
  /** Name of the vaccine */
  vaccineName: string;
  /** Whether this vaccine is mandatory/obligatory */
  isObligatory: boolean;
  /** Current coverage percentage (0-100) */
  coveragePercentage: number;
  /** Number of users with complete doses */
  completeDoses: number;
  /** Number of doses that should have been completed */
  shoudHaveDoses: number;
  /** Number of users with partial doses */
  partialDoses?: number;
  /** Coverage status indicator */
  status: VaccineCoverageStatus;
}

/**
 * Critical vaccine information (vaccines below target)
 */
export interface CriticalVaccine {
  /** Name of the vaccine */
  vaccineName: string;
  /** Current coverage percentage */
  coveragePercentage: number;
  /** Percentage gap to reach target */
  gapToTarget: number;
}

/**
 * Vaccination completion statistics by user
 */
export interface VaccinationCompletion {
  /** Number of users with all required vaccines completed */
  fullyVaccinatedUsers: number;
  /** Number of users with some vaccines but not all completed */
  partiallyVaccinatedUsers: number;
  /** Number of users who haven't started vaccination */
  notStartedUsers: number;
  /** Overall completion rate percentage (0-100) */
  completionRate: number;
}

/**
 * Complete vaccination coverage response from API
 */
export interface VaccinationCoverageResponse {
  /** Overall summary statistics */
  summary: VaccinationSummary;
  /** Detailed coverage data for each vaccine */
  details: VaccineCoverageDetail[];
  /** List of vaccines in critical status */
  criticalVaccines: CriticalVaccine[];
  /** User vaccination completion statistics */
  completion: VaccinationCompletion;
}
