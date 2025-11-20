import { useState, useCallback } from 'react';
import { vaccineApplicationService } from '../services/vaccineApplication.service';
import type { VaccinationHistory } from '../types';

interface UseVaccinationHistoryReturn {
  history: VaccinationHistory | null;
  isLoading: boolean;
  error: string | null;
  fetchHistory: (userId: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for managing user vaccination history
 * Handles fetching complete vaccination card data
 */
export const useVaccinationHistory = (): UseVaccinationHistoryReturn => {
  const [history, setHistory] = useState<VaccinationHistory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch vaccination history for a user
   */
  const fetchHistory = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const historyData = await vaccineApplicationService.getUserHistory(userId);
      setHistory(historyData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar histórico de vacinação';
      setError(errorMessage);
      setHistory(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    history,
    isLoading,
    error,
    fetchHistory,
    clearError,
  };
};
