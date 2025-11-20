import { api, handleApiError } from './api';
import type {
  VaccineApplication,
  CreateVaccineApplicationData,
  UpdateVaccineApplicationData,
  ListVaccineApplicationsParams,
  ListVaccineApplicationsResponse,
  VaccinationHistory,
} from '../types';

/**
 * Vaccine Application service
 * Handles all vaccine application-related API calls
 */
export const vaccineApplicationService = {
  /**
   * Create a new vaccine application (scheduled or walk-in)
   */
  create: async (data: CreateVaccineApplicationData): Promise<VaccineApplication> => {
    try {
      const response = await api.post<VaccineApplication>('/vaccine-applications', data);
      return response.data;
    } catch (error) {
      const message = handleApiError(error);

      // Authentication errors
      if (message.includes('Authentication') || message.includes('Unauthorized')) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      // Authorization errors
      if (message.includes('Forbidden') || message.includes('Only users with NURSE or MANAGER')) {
        throw new Error('Apenas enfermeiros e gerentes podem registrar aplicações de vacinas.');
      }

      // Validation errors
      if (message.includes('Either schedulingId')) {
        throw new Error('Forneça um agendamento OU informações do paciente/vacina, mas não ambos.');
      }

      // Not found errors
      if (message.includes('User') && message.includes('not found')) {
        throw new Error('Usuário não encontrado.');
      }
      if (message.includes('Vaccine') && message.includes('not found')) {
        throw new Error('Vacina não encontrada.');
      }
      if (message.includes('Batch') && message.includes('not found')) {
        throw new Error('Lote não encontrado.');
      }
      if (message.includes('Scheduling') && message.includes('not found')) {
        throw new Error('Agendamento não encontrado.');
      }

      // Business rule errors
      if (message.includes('Batch is not available')) {
        throw new Error('Lote não está disponível para uso.');
      }
      if (message.includes('insufficient quantity')) {
        throw new Error('Quantidade insuficiente no lote.');
      }
      if (message.includes('already received') || message.includes('Duplicate')) {
        throw new Error('Este usuário já recebeu esta dose desta vacina.');
      }
      if (message.includes('Previous doses must be applied')) {
        throw new Error('As doses anteriores devem ser aplicadas primeiro.');
      }
      if (message.includes('Minimum interval') && message.includes('not met')) {
        const match = message.match(/(\d+) days/);
        if (match) {
          throw new Error(`O intervalo mínimo entre doses ainda não foi atingido. Aguarde mais tempo.`);
        }
        throw new Error('O intervalo mínimo entre doses não foi atingido.');
      }
      if (message.includes('more doses than required') || message.includes('Exceeded')) {
        throw new Error('Esta vacina já possui todas as doses necessárias aplicadas.');
      }

      if (message.includes('Validation')) {
        throw new Error('Dados inválidos. Verifique os campos e tente novamente.');
      }

      throw new Error('Erro ao registrar aplicação de vacina.');
    }
  },

  /**
   * Get vaccine application by ID
   */
  getById: async (id: string): Promise<VaccineApplication> => {
    try {
      const response = await api.get<VaccineApplication>(`/vaccine-applications/${id}`);
      return response.data;
    } catch (error) {
      const message = handleApiError(error);

      if (message.includes('not found')) {
        throw new Error('Aplicação de vacina não encontrada.');
      }
      if (message.includes('Authentication') || message.includes('Unauthorized')) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      throw new Error('Erro ao buscar aplicação de vacina.');
    }
  },

  /**
   * List vaccine applications with pagination and filters
   */
  list: async (params?: ListVaccineApplicationsParams): Promise<ListVaccineApplicationsResponse> => {
    try {
      const response = await api.get<ListVaccineApplicationsResponse>('/vaccine-applications', { params });
      return response.data;
    } catch (error) {
      const message = handleApiError(error);

      if (message.includes('Authentication') || message.includes('Unauthorized')) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      if (message.includes('Validation')) {
        throw new Error('Parâmetros de busca inválidos.');
      }

      throw new Error('Erro ao listar aplicações de vacinas.');
    }
  },

  /**
   * Update vaccine application
   */
  update: async (id: string, data: UpdateVaccineApplicationData): Promise<VaccineApplication> => {
    try {
      const response = await api.patch<VaccineApplication>(`/vaccine-applications/${id}`, data);
      return response.data;
    } catch (error) {
      const message = handleApiError(error);

      if (message.includes('Authentication') || message.includes('Unauthorized')) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      if (message.includes('Only the nurse who applied') || message.includes('not authorized')) {
        throw new Error('Apenas o enfermeiro que aplicou a vacina ou um gerente pode editá-la.');
      }
      if (message.includes('not found')) {
        throw new Error('Aplicação de vacina não encontrada.');
      }
      if (message.includes('Validation')) {
        throw new Error('Dados inválidos. Verifique os campos e tente novamente.');
      }

      throw new Error('Erro ao atualizar aplicação de vacina.');
    }
  },

  /**
   * Get user vaccination history
   */
  getUserHistory: async (userId: string): Promise<VaccinationHistory> => {
    try {
      const response = await api.get<VaccinationHistory>(`/vaccine-applications/users/${userId}/history`);
      return response.data;
    } catch (error) {
      const message = handleApiError(error);

      if (message.includes('Authentication') || message.includes('Unauthorized')) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      if (message.includes('only view your own')) {
        throw new Error('Você só pode visualizar seu próprio histórico de vacinação.');
      }
      if (message.includes('User') && message.includes('not found')) {
        throw new Error('Usuário não encontrado.');
      }

      throw new Error('Erro ao buscar histórico de vacinação.');
    }
  },
};
