import { useState, useCallback } from 'react';
import { vaccineSchedulingService } from '../services/vaccineScheduling.service';
import type {
  VaccineScheduling,
  CreateVaccineSchedulingData,
  UpdateVaccineSchedulingData,
  ListVaccineSchedulingsParams,
  PaginatedResponse,
} from '../types';

interface UseVaccineSchedulingsReturn {
  schedulings: VaccineScheduling[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  isLoading: boolean;
  error: string | null;
  fetchSchedulings: (params?: ListVaccineSchedulingsParams) => Promise<void>;
  getSchedulingById: (id: string) => Promise<VaccineScheduling>;
  getSchedulingsByDate: (date?: string) => Promise<VaccineScheduling[]>;
  createScheduling: (data: CreateVaccineSchedulingData) => Promise<VaccineScheduling>;
  updateScheduling: (id: string, data: UpdateVaccineSchedulingData) => Promise<VaccineScheduling>;
  confirmScheduling: (id: string) => Promise<VaccineScheduling>;
  cancelScheduling: (id: string) => Promise<VaccineScheduling>;
  clearError: () => void;
}

/**
 * Custom hook for managing vaccine schedulings
 * Handles fetching, creating, updating, and deleting schedulings
 */
export const useVaccineSchedulings = (): UseVaccineSchedulingsReturn => {
  const [schedulings, setSchedulings] = useState<VaccineScheduling[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch schedulings with pagination and filters
   */
  const fetchSchedulings = useCallback(async (params?: ListVaccineSchedulingsParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<VaccineScheduling> = await vaccineSchedulingService.list(params);
      setSchedulings(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar agendamentos';
      setError(errorMessage);
      setSchedulings([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get scheduling by ID
   */
  const getSchedulingById = useCallback(async (id: string): Promise<VaccineScheduling> => {
    setIsLoading(true);
    setError(null);

    try {
      const scheduling = await vaccineSchedulingService.getById(id);
      return scheduling;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar agendamento';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get schedulings by date
   */
  const getSchedulingsByDate = useCallback(async (date?: string): Promise<VaccineScheduling[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const schedulings = await vaccineSchedulingService.getByDate(date);
      return schedulings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar agendamentos por data';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new scheduling
   */
  const createScheduling = useCallback(async (data: CreateVaccineSchedulingData): Promise<VaccineScheduling> => {
    setIsLoading(true);
    setError(null);

    try {
      const newScheduling = await vaccineSchedulingService.create(data);
      // Add new scheduling to the beginning of the list
      setSchedulings((prev) => [newScheduling, ...prev]);
      return newScheduling;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar agendamento';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update scheduling
   */
  const updateScheduling = useCallback(async (id: string, data: UpdateVaccineSchedulingData): Promise<VaccineScheduling> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedScheduling = await vaccineSchedulingService.update(id, data);
      // Update scheduling in the list
      setSchedulings((prev) =>
        prev.map((scheduling) => (scheduling.id === id ? updatedScheduling : scheduling))
      );
      return updatedScheduling;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar agendamento';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Confirm scheduling
   */
  const confirmScheduling = useCallback(async (id: string): Promise<VaccineScheduling> => {
    setIsLoading(true);
    setError(null);

    try {
      const confirmedScheduling = await vaccineSchedulingService.confirm(id);
      // Update scheduling in the list
      setSchedulings((prev) =>
        prev.map((scheduling) => (scheduling.id === id ? confirmedScheduling : scheduling))
      );
      return confirmedScheduling;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao confirmar agendamento';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cancel scheduling
   */
  const cancelScheduling = useCallback(async (id: string): Promise<VaccineScheduling> => {
    setIsLoading(true);
    setError(null);

    try {
      const cancelledScheduling = await vaccineSchedulingService.delete(id);
      // Update scheduling in the list or remove it
      setSchedulings((prev) =>
        prev.map((scheduling) => (scheduling.id === id ? cancelledScheduling : scheduling))
      );
      return cancelledScheduling;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cancelar agendamento';
      setError(errorMessage);
      throw err;
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
    schedulings,
    pagination,
    isLoading,
    error,
    fetchSchedulings,
    getSchedulingById,
    getSchedulingsByDate,
    createScheduling,
    updateScheduling,
    confirmScheduling,
    cancelScheduling,
    clearError,
  };
};
