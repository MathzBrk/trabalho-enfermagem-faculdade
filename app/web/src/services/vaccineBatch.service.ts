import { api, handleApiError } from './api';
import type {
  VaccineBatch,
  CreateVaccineBatchData,
  UpdateVaccineBatchData,
} from '../types';

/**
 * Vaccine Batch service
 * Handles all vaccine batch-related API calls
 */
export const vaccineBatchService = {
  /**
   * Get batch by ID
   */
  getById: async (batchId: string): Promise<VaccineBatch> => {
    try {
      const response = await api.get<VaccineBatch>(`/vaccine-batches/${batchId}`);
      return response.data;
    } catch (error) {
      const message = handleApiError(error);

      if (message.includes('not found')) {
        throw new Error('Lote não encontrado.');
      }
      if (message.includes('Authentication') || message.includes('Unauthorized')) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      throw new Error('Erro ao buscar lote.');
    }
  },

  /**
   * Create a new vaccine batch
   */
  create: async (data: CreateVaccineBatchData): Promise<VaccineBatch> => {
    try {
      const response = await api.post<VaccineBatch>('/vaccine-batches', data);
      return response.data;
    } catch (error) {
      const message = handleApiError(error);

      if (message.includes('Authentication') || message.includes('Unauthorized')) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      if (message.includes('Forbidden')) {
        throw new Error('Você não tem permissão para criar lotes.');
      }
      if (message.includes('already exists') || message.includes('duplicate')) {
        throw new Error('Já existe um lote com este número.');
      }
      if (message.includes('Vaccine not found')) {
        throw new Error('Vacina não encontrada.');
      }
      if (message.includes('Validation')) {
        throw new Error('Dados inválidos. Verifique os campos e tente novamente.');
      }

      throw new Error('Erro ao criar lote.');
    }
  },

  /**
   * Update vaccine batch
   */
  update: async (batchId: string, data: UpdateVaccineBatchData): Promise<VaccineBatch> => {
    try {
      const response = await api.patch<VaccineBatch>(`/vaccine-batches/${batchId}`, data);
      return response.data;
    } catch (error) {
      const message = handleApiError(error);

      if (message.includes('Authentication') || message.includes('Unauthorized')) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      if (message.includes('Forbidden')) {
        throw new Error('Você não tem permissão para editar lotes.');
      }
      if (message.includes('not found')) {
        throw new Error('Lote não encontrado.');
      }
      if (message.includes('already exists') || message.includes('duplicate')) {
        throw new Error('Já existe um lote com este número.');
      }
      if (message.includes('Validation')) {
        throw new Error('Dados inválidos. Verifique os campos e tente novamente.');
      }

      throw new Error('Erro ao atualizar lote.');
    }
  },
};
