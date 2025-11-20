import { api, handleApiError } from './api';

/**
 * Scheduling Status enum
 */
export const SchedulingStatus = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type SchedulingStatus =
  (typeof SchedulingStatus)[keyof typeof SchedulingStatus];

/**
 * Monthly Scheduling Response Types
 */
export interface MonthlySchedulingItem {
  id: string;
  scheduledDate: string;
  status: SchedulingStatus;
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
 * Vaccine Scheduling Service
 * Handles vaccine scheduling API calls
 */
export const vaccineSchedulingService = {
  /**
   * Get monthly schedulings for a nurse
   * @param nurseId - ID of the nurse (not used in API call - uses authenticated user)
   * @param year - Year (YYYY)
   * @param month - Month (0-11, where 0 = January, 11 = December)
   * @returns Object with dates as keys and array of schedulings as values
   */
  getNurseMonthlySchedulings: async (
    nurseId: string,
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
      const message = handleApiError(error);

      if (message.includes('not found')) {
        throw new Error('Agendamentos não encontrados.');
      }
      if (
        message.includes('Authentication') ||
        message.includes('Unauthorized')
      ) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      if (message.includes('Forbidden')) {
        throw new Error(
          'Você não tem permissão para visualizar estes agendamentos.',
        );
      }

      throw new Error('Erro ao buscar agendamentos mensais.');
    }
  },
};
