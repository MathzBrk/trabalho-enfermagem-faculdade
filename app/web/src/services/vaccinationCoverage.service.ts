/**
 * Vaccination Coverage Service - API integration for vaccination coverage analytics
 *
 * Provides vaccination coverage statistics and analytics for managers including:
 * - Overall coverage summary
 * - Detailed vaccine-by-vaccine coverage
 * - Critical vaccines below target
 * - User completion statistics
 *
 * @requires MANAGER role
 */

import { api, handleApiError } from './api';
import type { VaccinationCoverageResponse } from '../types/vaccinationCoverage';

/**
 * Vaccination Coverage service class
 */
class VaccinationCoverageService {
  private readonly baseURL = '/vaccination-coverage';

  /**
   * Get vaccination coverage analytics for the organization
   *
   * Provides comprehensive statistics on vaccination coverage including:
   * - Summary: average coverage, targets reached, critical vaccines
   * - Details: coverage percentage and status for each vaccine
   * - Critical vaccines: vaccines below target with gap analysis
   * - Completion: user vaccination completion statistics
   *
   * @returns Promise<VaccinationCoverageResponse> Vaccination coverage data
   * @throws {ApiError} 401 if not authenticated
   * @throws {ApiError} 403 if user is not a MANAGER
   * @throws {ApiError} 500 if server error occurs
   *
   * @example
   * ```typescript
   * const coverage = await vaccinationCoverageService.getCoverage();
   * console.log(`Average coverage: ${coverage.summary.averageCoverage}%`);
   * console.log(`Critical vaccines: ${coverage.summary.criticalVaccines}`);
   * ```
   */
  async getCoverage(): Promise<VaccinationCoverageResponse> {
    try {
      const response = await api.get<VaccinationCoverageResponse>(this.baseURL);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Helper method to check if user has manager role
   * Can be used before calling getCoverage to prevent unnecessary API calls
   *
   * @param userRole - The role of the current user
   * @returns boolean indicating if user is a manager
   */
  canAccessCoverage(userRole: string): boolean {
    return userRole === 'MANAGER';
  }
}

/**
 * Singleton instance of VaccinationCoverageService
 */
export const vaccinationCoverageService = new VaccinationCoverageService();
