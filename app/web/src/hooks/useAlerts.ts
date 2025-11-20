/**
 * useAlerts Hook - Custom hook for managing alerts state
 *
 * Fetches and manages real-time inventory alerts for managers.
 * Handles loading states, errors, and provides manual refresh capability.
 *
 * @example
 * ```typescript
 * const { alerts, loading, error, refetch } = useAlerts();
 *
 * if (loading) return <Spinner />;
 * if (error) return <ErrorMessage error={error} />;
 *
 * return (
 *   <div>
 *     <button onClick={refetch}>Refresh</button>
 *     {alerts.map(alert => <AlertCard key={alert.alertType} alert={alert} />)}
 *   </div>
 * );
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { alertsService } from '../services/alerts.service';
import type { Alert } from '../types/alerts';

/**
 * Return type for useAlerts hook
 */
export interface UseAlertsReturn {
  /** Array of current alerts */
  alerts: Alert[];
  /** Loading state - true while fetching alerts */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Function to manually refresh alerts */
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage alerts
 *
 * Features:
 * - Automatic fetch on mount
 * - Loading and error state management
 * - Manual refresh capability
 * - Type-safe alert data
 *
 * @returns {UseAlertsReturn} Alert state and control functions
 */
export const useAlerts = (): UseAlertsReturn => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch alerts from API
   * Memoized to prevent unnecessary re-creation
   */
  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await alertsService.getAlerts();

      // Filter out empty alert types for cleaner UI
      const nonEmptyAlerts = data.filter(alert => alert.objects.length > 0);
      setAlerts(nonEmptyAlerts);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to fetch alerts. Please try again later.';

      setError(errorMessage);
      setAlerts([]);

      // Log error for debugging (will not appear in production if console is disabled)
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch alerts on component mount
   */
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    refetch: fetchAlerts,
  };
};
