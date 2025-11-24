import type {
  Vaccine,
  VaccineBatch,
  VaccineScheduling,
  VaccineApplication,
  Notification,
} from '../types';

// Note: Mock users have been removed - use real API data instead

// Mock Vaccines
export const mockVaccines: Vaccine[] = [
  {
    id: 'v1',
    name: 'Vacina contra Gripe',
    manufacturer: 'Instituto Butantan',
    description: 'Vacina contra Influenza (gripe)',
    dosesRequired: 1,
    totalStock: 450,
    isObligatory: false,
    createdById: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'v2',
    name: 'COVID-19',
    manufacturer: 'Pfizer',
    description: 'Vacina contra COVID-19',
    dosesRequired: 2,
    intervalDays: 21,
    totalStock: 250,
    isObligatory: true,
    createdById: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'v3',
    name: 'Hepatite B',
    manufacturer: 'GSK',
    description: 'Vacina contra Hepatite B',
    dosesRequired: 3,
    intervalDays: 30,
    totalStock: 180,
    isObligatory: true,
    createdById: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'v4',
    name: 'Tétano',
    manufacturer: 'Sanofi',
    description: 'Vacina contra Tétano',
    dosesRequired: 1,
    totalStock: 100,
    isObligatory: true,
    createdById: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Mock Vaccine Batches
export const mockVaccineBatches: VaccineBatch[] = [
  {
    id: 'b1',
    vaccineId: 'v1',
    vaccine: mockVaccines[0],
    batchNumber: 'FLU2024001',
    initialQuantity: 500,
    currentQuantity: 450,
    expirationDate: '2024-12-31',
    receivedDate: '2024-01-01',
    status: 'AVAILABLE' as const,
    createdById: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'b2',
    vaccineId: 'v2',
    vaccine: mockVaccines[1],
    batchNumber: 'COV2024001',
    initialQuantity: 300,
    currentQuantity: 250,
    expirationDate: '2024-06-30',
    receivedDate: '2024-01-01',
    status: 'AVAILABLE' as const,
    createdById: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'b3',
    vaccineId: 'v3',
    vaccine: mockVaccines[2],
    batchNumber: 'HEP2024001',
    initialQuantity: 200,
    currentQuantity: 180,
    expirationDate: '2025-01-01',
    receivedDate: '2024-01-01',
    status: 'AVAILABLE' as const,
    createdById: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Mock Vaccine Schedulings (user references removed - use real API data)
export const mockSchedulings: VaccineScheduling[] = [];

// Mock Vaccine Applications (user references removed - use real API data)
export const mockApplications: VaccineApplication[] = [];

// Mock Notifications (use real API data instead)
export const mockNotifications: Notification[] = [];
