import { useState, useCallback } from 'react';
import { vaccineApplicationService } from '../services/vaccineApplication.service';
import type {
  VaccineApplication,
  CreateVaccineApplicationData,
  UpdateVaccineApplicationData,
  ListVaccineApplicationsParams,
  Pagination,
} from '../types';

interface UseVaccineApplicationsReturn {
  applications: VaccineApplication[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  fetchApplications: (params?: ListVaccineApplicationsParams) => Promise<void>;
  createApplication: (data: CreateVaccineApplicationData) => Promise<VaccineApplication>;
  updateApplication: (id: string, data: UpdateVaccineApplicationData) => Promise<VaccineApplication>;
  getApplicationById: (id: string) => Promise<VaccineApplication>;
  clearError: () => void;
}

/**
 * Custom hook for managing vaccine applications
 * Handles fetching, creating, and updating vaccine applications
 */
export const useVaccineApplications = (): UseVaccineApplicationsReturn => {
  const [applications, setApplications] = useState<VaccineApplication[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch vaccine applications with pagination and filters
   */
  const fetchApplications = useCallback(async (params?: ListVaccineApplicationsParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await vaccineApplicationService.list(params);
      setApplications(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar aplicações de vacinas';
      setError(errorMessage);
      setApplications([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get application by ID
   */
  const getApplicationById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const application = await vaccineApplicationService.getById(id);
      return application;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar aplicação de vacina';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new vaccine application
   */
  const createApplication = useCallback(async (data: CreateVaccineApplicationData): Promise<VaccineApplication> => {
    setIsLoading(true);
    setError(null);

    try {
      const newApplication = await vaccineApplicationService.create(data);
      // Add to list if currently showing applications
      setApplications((prev) => [newApplication, ...prev]);
      return newApplication;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar aplicação de vacina';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update vaccine application
   */
  const updateApplication = useCallback(async (id: string, data: UpdateVaccineApplicationData): Promise<VaccineApplication> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedApplication = await vaccineApplicationService.update(id, data);
      // Update application in the list
      setApplications((prev) =>
        prev.map((application) => (application.id === id ? updatedApplication : application))
      );
      return updatedApplication;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar aplicação de vacina';
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
    applications,
    pagination,
    isLoading,
    error,
    fetchApplications,
    createApplication,
    updateApplication,
    getApplicationById,
    clearError,
  };
};
