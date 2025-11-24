import { api, handleApiError } from './api';
import type {
  VaccineScheduling,
  CreateVaccineSchedulingData,
  UpdateVaccineSchedulingData,
  ListVaccineSchedulingsParams,
  PaginatedResponse,
} from '../types';

/**
 * Monthly Scheduling Response Types
 */
export interface MonthlySchedulingItem {
  id: string;
  scheduledDate: string;
  status: string;
  doseNumber: number;
  notes: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    cpf: string;
    phone: string | null;
  };
  vaccine: {
    id: string;
    name: string;
    manufacturer: string;
    dosesRequired: number;
  };
  assignedNurse: {
    id: string;
    name: string;
    email: string;
    coren: string | null;
  };
  application: {
    id: string;
    applicationDate: string;
    applicationSite: string;
  } | null;
}

export interface MonthlySchedulingsResponse {
  [date: string]: MonthlySchedulingItem[];
}

/**
 * Error message mapping for better UX
 */
const ERROR_MESSAGES: Record<string, string> = {
  InsufficientStockError: 'Estoque insuficiente para esta vacina',
  InvalidSchedulingDateError: 'A data deve ser no futuro',
  MissingPreviousDoseError: 'Você precisa agendar as doses anteriores primeiro',
  DuplicateSchedulingError: 'Você já tem um agendamento para esta dose',
  InvalidDoseNumberError: 'Número de dose inválido para esta vacina',
  VaccineNotFoundError: 'Vacina não encontrada',
  UserNotFoundError: 'Usuário não encontrado',
  VaccineSchedulingNotFoundError: 'Agendamento não encontrado',
  UnauthorizedSchedulingAccessError: 'Você não tem permissão para acessar este agendamento',
  SchedulingAlreadyCompletedError: 'Não é possível modificar um agendamento já concluído',
};

/**
 * Get user-friendly error message
 */
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  const message = handleApiError(error);

  // Check for known error types
  for (const [errorType, friendlyMessage] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(errorType)) {
      return friendlyMessage;
    }
  }

  // Return the original message if it's specific enough, otherwise use default
  if (message && message !== 'An unexpected error occurred' && message !== 'An error occurred') {
    return message;
  }

  return defaultMessage;
};

/**
 * Vaccine Scheduling Service
 * Handles vaccine scheduling API calls
 */
export const vaccineSchedulingService = {
  /**
   * Create a new vaccine scheduling
   * The authenticated user will be automatically set as the patient
   */
  create: async (data: CreateVaccineSchedulingData): Promise<VaccineScheduling> => {
    try {
      const response = await api.post<VaccineScheduling>('/vaccine-schedulings', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Erro ao criar agendamento'));
    }
  },

  /**
   * Get scheduling by ID
   */
  getById: async (id: string): Promise<VaccineScheduling> => {
    try {
      const response = await api.get<VaccineScheduling>(`/vaccine-schedulings/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Erro ao buscar agendamento'));
    }
  },

  /**
   * List schedulings with pagination and filters
   */
  list: async (params?: ListVaccineSchedulingsParams): Promise<PaginatedResponse<VaccineScheduling>> => {
    try {
      const response = await api.get<PaginatedResponse<VaccineScheduling>>('/vaccine-schedulings', { params });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Erro ao listar agendamentos'));
    }
  },

  /**
   * Get schedulings by date
   * If no date is provided, returns schedulings for current date
   */
  getByDate: async (date?: string): Promise<VaccineScheduling[]> => {
    try {
      const params = date ? { date } : undefined;
      const response = await api.get<VaccineScheduling[]>('/vaccine-schedulings/by-date', { params });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Erro ao buscar agendamentos por data'));
    }
  },

  /**
   * Get monthly schedulings for a nurse
   * @param _nurseId - ID of the nurse (not used in API call - uses authenticated user)
   * @param year - Year (YYYY)
   * @param month - Month (0-11, where 0 = January, 11 = December)
   * @returns Object with dates as keys and array of schedulings as values
   */
  getNurseMonthlySchedulings: async (
    _nurseId: string,
    year: number,
    month: number,
  ): Promise<MonthlySchedulingsResponse> => {
    try {
      const response = await api.get<MonthlySchedulingsResponse>(
        '/vaccine-schedulings/nurse/monthly',
        {
          params: {
            year,
            month,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Erro ao buscar agendamentos mensais'));
    }
  },

  /**
   * Update scheduling
   */
  update: async (id: string, data: UpdateVaccineSchedulingData): Promise<VaccineScheduling> => {
    try {
      const response = await api.patch<VaccineScheduling>(`/vaccine-schedulings/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Erro ao atualizar agendamento'));
    }
  },

  /**
   * Delete (cancel) scheduling
   */
  delete: async (id: string): Promise<VaccineScheduling> => {
    try {
      const response = await api.delete<VaccineScheduling>(`/vaccine-schedulings/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Erro ao cancelar agendamento'));
    }
  },

  /**
   * Confirm scheduling (update status to CONFIRMED)
   */
  confirm: async (id: string): Promise<VaccineScheduling> => {
    try {
      const response = await api.patch<VaccineScheduling>(`/vaccine-schedulings/${id}`, {
        status: 'CONFIRMED',
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Erro ao confirmar agendamento'));
    }
  },
};
