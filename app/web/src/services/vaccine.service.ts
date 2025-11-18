import { api, handleApiError } from './api';
import type {
  Vaccine,
  VaccineBatch,
  VaccineScheduling,
  VaccineApplication,
  CreateVaccineData,
  UpdateVaccineData,
  CreateVaccineBatchData,
  CreateVaccineSchedulingData,
  CreateVaccineApplicationData,
  ListVaccinesParams,
  PaginatedResponse,
  ListVaccineBatchesParams,
} from '../types';
import {
  mockVaccines,
  mockVaccineBatches,
  mockSchedulings,
  mockApplications,
} from '../utils/mockData';

/**
 * Vaccine service
 * Handles all vaccine-related API calls
 */
export const vaccineService = {
  /**
   * List vaccines with pagination and filters
   */
  list: async (params?: ListVaccinesParams): Promise<PaginatedResponse<Vaccine>> => {
    try {
      const response = await api.get<PaginatedResponse<Vaccine>>('/vaccines', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get vaccine by ID
   */
  getById: async (vaccineId: string, includeBatches = false): Promise<Vaccine | (Vaccine & { batches: PaginatedResponse<VaccineBatch> })> => {
    try {
      const params = includeBatches ? { include: 'batches' } : undefined;
      const response = await api.get(`/vaccines/${vaccineId}`, { params });
      return response.data;
    } catch (error) {
      const message = handleApiError(error);

      if (message.includes('not found')) {
        throw new Error('Vacina não encontrada.');
      }
      if (message.includes('Authentication') || message.includes('Unauthorized')) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      throw new Error('Erro ao buscar vacina.');
    }
  },

  /**
   * Get vaccine batches
   */
  getBatches: async (vaccineId: string, params?: ListVaccineBatchesParams): Promise<PaginatedResponse<VaccineBatch>> => {
    try {
      const response = await api.get<PaginatedResponse<VaccineBatch>>(`/vaccines/${vaccineId}/batches`, { params });
      return response.data;
    } catch (error) {
      const message = handleApiError(error);

      if (message.includes('not found')) {
        throw new Error('Vacina não encontrada.');
      }

      throw new Error('Erro ao buscar lotes da vacina.');
    }
  },

  /**
   * Create a new vaccine
   */
  create: async (data: CreateVaccineData): Promise<Vaccine> => {
    try {
      const response = await api.post<Vaccine>('/vaccines', data);
      return response.data;
    } catch (error) {
      const message = handleApiError(error);

      if (message.includes('Authentication') || message.includes('Unauthorized')) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      if (message.includes('Forbidden')) {
        throw new Error('Você não tem permissão para criar vacinas.');
      }
      if (message.includes('already exists') || message.includes('duplicate')) {
        throw new Error('Já existe uma vacina com este nome e fabricante.');
      }
      if (message.includes('Validation')) {
        throw new Error('Dados inválidos. Verifique os campos e tente novamente.');
      }

      throw new Error('Erro ao criar vacina.');
    }
  },

  /**
   * Update vaccine
   */
  update: async (vaccineId: string, data: UpdateVaccineData): Promise<Vaccine> => {
    try {
      const response = await api.patch<Vaccine>(`/vaccines/${vaccineId}`, data);
      return response.data;
    } catch (error) {
      const message = handleApiError(error);

      if (message.includes('Authentication') || message.includes('Unauthorized')) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      if (message.includes('Forbidden')) {
        throw new Error('Você não tem permissão para editar vacinas.');
      }
      if (message.includes('not found')) {
        throw new Error('Vacina não encontrada.');
      }
      if (message.includes('already exists') || message.includes('duplicate')) {
        throw new Error('Já existe uma vacina com este nome e fabricante.');
      }
      if (message.includes('Validation')) {
        throw new Error('Dados inválidos. Verifique os campos e tente novamente.');
      }

      throw new Error('Erro ao atualizar vacina.');
    }
  },

  /**
   * Delete vaccine
   */
  delete: async (vaccineId: string): Promise<void> => {
    try {
      await api.delete(`/vaccines/${vaccineId}`);
    } catch (error) {
      const message = handleApiError(error);

      if (message.includes('Authentication') || message.includes('Unauthorized')) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      if (message.includes('Forbidden')) {
        throw new Error('Apenas gerentes podem excluir vacinas.');
      }
      if (message.includes('not found')) {
        throw new Error('Vacina não encontrada.');
      }
      if (message.includes('cannot be deleted') || message.includes('has associated')) {
        throw new Error('Não é possível excluir esta vacina pois existem registros associados.');
      }

      throw new Error('Erro ao excluir vacina.');
    }
  },

  // Legacy methods for compatibility
  /**
   * List all vaccines (legacy)
   */
  listVaccines: async (): Promise<Vaccine[]> => {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockVaccines);
      }, 500);
    });
  },

  /**
   * Create a new vaccine (legacy)
   */
  createVaccine: async (data: CreateVaccineData): Promise<Vaccine> => {
    return vaccineService.create(data);
  },

  /**
   * List all vaccine batches (legacy)
   */
  listBatches: async (): Promise<VaccineBatch[]> => {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockVaccineBatches);
      }, 500);
    });
  },

  /**
   * Create a new vaccine batch (legacy)
   */
  createBatch: async (data: CreateVaccineBatchData): Promise<VaccineBatch> => {
    // Real API call
    const response = await api.post<VaccineBatch>('/vaccine-batches', data);
    return response.data;
  },

  /**
   * List vaccine schedulings for a user
   */
  listSchedulings: async (userId?: string): Promise<VaccineScheduling[]> => {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        if (userId) {
          const userSchedulings = mockSchedulings.filter((s) => s.userId === userId);
          resolve(userSchedulings);
        } else {
          resolve(mockSchedulings);
        }
      }, 500);
    });

    // Real API call (commented out for now)
    // const params = userId ? { userId } : {};
    // const response = await api.get<VaccineScheduling[]>('/vaccine-schedulings', { params });
    // return response.data;
  },

  /**
   * List vaccine schedulings for a nurse
   */
  listSchedulingsForNurse: async (nurseId: string): Promise<VaccineScheduling[]> => {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const nurseSchedulings = mockSchedulings.filter(
          (s) => s.assignedNurseId === nurseId
        );
        resolve(nurseSchedulings);
      }, 500);
    });

    // Real API call (commented out for now)
    // const response = await api.get<VaccineScheduling[]>('/vaccine-schedulings', {
    //   params: { assignedNurseId: nurseId },
    // });
    // return response.data;
  },

  /**
   * Create a new vaccine scheduling
   */
  createScheduling: async (
    data: CreateVaccineSchedulingData
  ): Promise<VaccineScheduling> => {
    // Real API call
    const response = await api.post<VaccineScheduling>('/vaccine-schedulings', data);
    return response.data;
  },

  /**
   * List vaccine applications for a user
   */
  listApplications: async (userId?: string): Promise<VaccineApplication[]> => {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        if (userId) {
          const userApplications = mockApplications.filter((a) => a.userId === userId);
          resolve(userApplications);
        } else {
          resolve(mockApplications);
        }
      }, 500);
    });

    // Real API call (commented out for now)
    // const params = userId ? { userId } : {};
    // const response = await api.get<VaccineApplication[]>('/vaccine-applications', { params });
    // return response.data;
  },

  /**
   * Create a new vaccine application
   */
  createApplication: async (
    data: CreateVaccineApplicationData
  ): Promise<VaccineApplication> => {
    // Real API call
    const response = await api.post<VaccineApplication>('/vaccine-applications', data);
    return response.data;
  },
};
