/**
 * useVaccinationCoverage Hook - Custom hook for managing vaccination coverage state
 *
 * Fetches and manages vaccination coverage analytics for managers.
 * Handles loading states, errors, and provides manual refresh capability.
 *
 * @example
 * ```typescript
 * const { coverage, loading, error, refetch } = useVaccinationCoverage();
 *
 * if (loading) return <Spinner />;
 * if (error) return <ErrorMessage error={error} />;
 * if (!coverage) return <EmptyState />;
 *
 * return (
 *   <div>
 *     <button onClick={refetch}>Refresh</button>
 *     <CoverageSummary summary={coverage.summary} />
 *     <CoverageChart details={coverage.details} />
 *   </div>
 * );
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { vaccinationCoverageService } from '../services/vaccinationCoverage.service';
import type { VaccinationCoverageResponse } from '../types/vaccinationCoverage';

/**
 * Return type for useVaccinationCoverage hook
 */
export interface UseVaccinationCoverageReturn {
  /** Vaccination coverage data, null if not loaded yet */
  coverage: VaccinationCoverageResponse | null;
  /** Loading state - true while fetching coverage data */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Function to manually refresh coverage data */
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage vaccination coverage data
 *
 * Features:
 * - Automatic fetch on mount
 * - Loading and error state management
 * - Manual refresh capability
 * - Type-safe coverage data
 *
 * @returns {UseVaccinationCoverageReturn} Coverage state and control functions
 */
export const useVaccinationCoverage = (): UseVaccinationCoverageReturn => {
  const [coverage, setCoverage] = useState<VaccinationCoverageResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch vaccination coverage from API
   * Memoized to prevent unnecessary re-creation
   */
  const fetchCoverage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vaccinationCoverageService.getCoverage();
      setCoverage(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch vaccination coverage. Please try again later.';

      setError(errorMessage);
      setCoverage(null);

      // Log error for debugging (will not appear in production if console is disabled)
      console.error('Error fetching vaccination coverage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch coverage on component mount
   */
  useEffect(() => {
    fetchCoverage();
  }, [fetchCoverage]);

  return {
    coverage,
    loading,
    error,
    refetch: fetchCoverage,
  };
};
