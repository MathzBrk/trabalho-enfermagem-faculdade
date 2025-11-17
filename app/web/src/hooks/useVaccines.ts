import { useState, useCallback } from 'react';
import { vaccineService } from '../services/vaccine.service';
import type {
  Vaccine,
  CreateVaccineData,
  UpdateVaccineData,
  ListVaccinesParams,
  PaginatedResponse,
} from '../types';

interface UseVaccinesReturn {
  vaccines: Vaccine[];
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
  fetchVaccines: (params?: ListVaccinesParams) => Promise<void>;
  createVaccine: (data: CreateVaccineData) => Promise<Vaccine>;
  updateVaccine: (id: string, data: UpdateVaccineData) => Promise<Vaccine>;
  deleteVaccine: (id: string) => Promise<void>;
  getVaccineById: (id: string, includeBatches?: boolean) => Promise<Vaccine | any>;
  clearError: () => void;
}

/**
 * Custom hook for managing vaccines
 * Handles fetching, creating, updating, and deleting vaccines
 */
export const useVaccines = (): UseVaccinesReturn => {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
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
   * Fetch vaccines with pagination and filters
   */
  const fetchVaccines = useCallback(async (params?: ListVaccinesParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<Vaccine> = await vaccineService.list(params);
      setVaccines(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar vacinas';
      setError(errorMessage);
      setVaccines([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get vaccine by ID
   */
  const getVaccineById = useCallback(async (id: string, includeBatches = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const vaccine = await vaccineService.getById(id, includeBatches);
      return vaccine;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar vacina';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new vaccine
   */
  const createVaccine = useCallback(async (data: CreateVaccineData): Promise<Vaccine> => {
    setIsLoading(true);
    setError(null);

    try {
      const newVaccine = await vaccineService.create(data);
      // Refresh vaccine list after creation
      setVaccines((prev) => [newVaccine, ...prev]);
      return newVaccine;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar vacina';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update vaccine
   */
  const updateVaccine = useCallback(async (id: string, data: UpdateVaccineData): Promise<Vaccine> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedVaccine = await vaccineService.update(id, data);
      // Update vaccine in the list
      setVaccines((prev) =>
        prev.map((vaccine) => (vaccine.id === id ? updatedVaccine : vaccine))
      );
      return updatedVaccine;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar vacina';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete vaccine
   */
  const deleteVaccine = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await vaccineService.delete(id);
      // Remove vaccine from the list
      setVaccines((prev) => prev.filter((vaccine) => vaccine.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir vacina';
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
    vaccines,
    pagination,
    isLoading,
    error,
    fetchVaccines,
    createVaccine,
    updateVaccine,
    deleteVaccine,
    getVaccineById,
    clearError,
  };
};
