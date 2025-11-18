import { useState, useCallback } from 'react';
import { vaccineService } from '../services/vaccine.service';
import { vaccineBatchService } from '../services/vaccineBatch.service';
import type {
  VaccineBatch,
  CreateVaccineBatchData,
  UpdateVaccineBatchData,
  ListVaccineBatchesParams,
  PaginatedResponse,
} from '../types';

interface UseVaccineBatchesReturn {
  batches: VaccineBatch[];
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
  fetchBatches: (vaccineId: string, params?: ListVaccineBatchesParams) => Promise<void>;
  createBatch: (data: CreateVaccineBatchData) => Promise<VaccineBatch>;
  updateBatch: (id: string, data: UpdateVaccineBatchData) => Promise<VaccineBatch>;
  getBatchById: (id: string) => Promise<VaccineBatch>;
  clearError: () => void;
}

/**
 * Custom hook for managing vaccine batches
 * Handles fetching, creating, and updating vaccine batches
 */
export const useVaccineBatches = (): UseVaccineBatchesReturn => {
  const [batches, setBatches] = useState<VaccineBatch[]>([]);
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
   * Fetch batches for a specific vaccine with pagination and filters
   */
  const fetchBatches = useCallback(async (vaccineId: string, params?: ListVaccineBatchesParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<VaccineBatch> = await vaccineService.getBatches(vaccineId, params);
      setBatches(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar lotes';
      setError(errorMessage);
      setBatches([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get batch by ID
   */
  const getBatchById = useCallback(async (id: string): Promise<VaccineBatch> => {
    setIsLoading(true);
    setError(null);

    try {
      const batch = await vaccineBatchService.getById(id);
      return batch;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar lote';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new vaccine batch
   */
  const createBatch = useCallback(async (data: CreateVaccineBatchData): Promise<VaccineBatch> => {
    setIsLoading(true);
    setError(null);

    try {
      const newBatch = await vaccineBatchService.create(data);
      // Add new batch to the list
      setBatches((prev) => [newBatch, ...prev]);
      return newBatch;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar lote';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update vaccine batch
   */
  const updateBatch = useCallback(async (id: string, data: UpdateVaccineBatchData): Promise<VaccineBatch> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedBatch = await vaccineBatchService.update(id, data);
      // Update batch in the list
      setBatches((prev) =>
        prev.map((batch) => (batch.id === id ? updatedBatch : batch))
      );
      return updatedBatch;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar lote';
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
    batches,
    pagination,
    isLoading,
    error,
    fetchBatches,
    createBatch,
    updateBatch,
    getBatchById,
    clearError,
  };
};
