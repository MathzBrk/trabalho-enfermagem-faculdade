import { api } from './api';
import type {
  Vaccine,
  VaccineBatch,
  VaccineScheduling,
  VaccineApplication,
  CreateVaccineData,
  CreateVaccineBatchData,
  CreateVaccineSchedulingData,
  CreateVaccineApplicationData,
} from '../types';
import {
  mockVaccines,
  mockVaccineBatches,
  mockSchedulings,
  mockApplications,
} from '../utils/mockData';

/**
 * Vaccine service
 * Currently using mock data - will integrate with real API later
 */
export const vaccineService = {
  /**
   * List all vaccines
   */
  listVaccines: async (): Promise<Vaccine[]> => {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockVaccines);
      }, 500);
    });

    // Real API call (commented out for now)
    // const response = await api.get<Vaccine[]>('/vaccines');
    // return response.data;
  },

  /**
   * Create a new vaccine
   */
  createVaccine: async (data: CreateVaccineData): Promise<Vaccine> => {
    // Real API call
    const response = await api.post<Vaccine>('/vaccines', data);
    return response.data;
  },

  /**
   * List all vaccine batches
   */
  listBatches: async (): Promise<VaccineBatch[]> => {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockVaccineBatches);
      }, 500);
    });

    // Real API call (commented out for now)
    // const response = await api.get<VaccineBatch[]>('/vaccine-batches');
    // return response.data;
  },

  /**
   * Create a new vaccine batch
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
