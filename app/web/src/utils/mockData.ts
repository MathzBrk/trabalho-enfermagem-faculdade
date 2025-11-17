import type {
  MockUser,
  User,
  Vaccine,
  VaccineBatch,
  VaccineScheduling,
  VaccineApplication,
  Notification,
} from '../types';
import { UserRole as UserRoleEnum, VaccineApplicationStatus as VaccineApplicationStatusEnum, NotificationType as NotificationTypeEnum } from '../types';

// Mock Users with passwords for testing
export const mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'employee@test.com',
    password: 'password123',
    cpf: '12345678900',
    role: UserRoleEnum.EMPLOYEE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    email: 'nurse@test.com',
    password: 'password123',
    cpf: '98765432100',
    role: UserRoleEnum.NURSE,
    coren: '123456SP',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Carlos Santos',
    email: 'manager@test.com',
    password: 'password123',
    cpf: '11122233344',
    role: UserRoleEnum.MANAGER,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana.costa@test.com',
    password: 'password123',
    cpf: '55566677788',
    role: UserRoleEnum.EMPLOYEE,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '5',
    name: 'Pedro Almeida',
    email: 'pedro.nurse@test.com',
    password: 'password123',
    cpf: '99988877766',
    role: UserRoleEnum.NURSE,
    coren: '654321RJ',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

// Mock Vaccines
export const mockVaccines: Vaccine[] = [
  {
    id: 'v1',
    name: 'Vacina contra Gripe',
    manufacturer: 'Instituto Butantan',
    description: 'Vacina contra Influenza (gripe)',
    dosesRequired: 1,
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
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'v4',
    name: 'Tétano',
    manufacturer: 'Sanofi',
    description: 'Vacina contra Tétano',
    dosesRequired: 1,
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
    manufacturingDate: '2024-01-01',
    expirationDate: '2024-12-31',
    quantity: 500,
    availableQuantity: 450,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'b2',
    vaccineId: 'v2',
    vaccine: mockVaccines[1],
    batchNumber: 'COV2024001',
    manufacturingDate: '2024-01-01',
    expirationDate: '2024-06-30',
    quantity: 300,
    availableQuantity: 250,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'b3',
    vaccineId: 'v3',
    vaccine: mockVaccines[2],
    batchNumber: 'HEP2024001',
    manufacturingDate: '2024-01-01',
    expirationDate: '2025-01-01',
    quantity: 200,
    availableQuantity: 180,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Mock Vaccine Schedulings
export const mockSchedulings: VaccineScheduling[] = [
  {
    id: 's1',
    userId: '1',
    user: mockUsers[0],
    vaccineId: 'v1',
    vaccine: mockVaccines[0],
    assignedNurseId: '2',
    assignedNurse: mockUsers[1],
    scheduledDate: '2024-11-20T10:00:00Z',
    doseNumber: 1,
    notes: 'Primeira dose da vacina contra gripe',
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },
  {
    id: 's2',
    userId: '1',
    user: mockUsers[0],
    vaccineId: 'v2',
    vaccine: mockVaccines[1],
    assignedNurseId: '2',
    assignedNurse: mockUsers[1],
    scheduledDate: '2024-11-25T14:00:00Z',
    doseNumber: 1,
    notes: 'Primeira dose COVID-19',
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },
  {
    id: 's3',
    userId: '4',
    user: mockUsers[3],
    vaccineId: 'v3',
    vaccine: mockVaccines[2],
    assignedNurseId: '5',
    assignedNurse: mockUsers[4],
    scheduledDate: '2024-11-18T09:00:00Z',
    doseNumber: 1,
    notes: 'Primeira dose Hepatite B',
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },
];

// Mock Vaccine Applications
export const mockApplications: VaccineApplication[] = [
  {
    id: 'a1',
    userId: '1',
    user: mockUsers[0],
    vaccineId: 'v1',
    vaccine: mockVaccines[0],
    batchId: 'b1',
    batch: mockVaccineBatches[0],
    nurseId: '2',
    nurse: mockUsers[1],
    schedulingId: 's1',
    applicationDate: '2024-10-15T10:00:00Z',
    doseNumber: 1,
    applicationSite: 'Braço direito',
    observations: 'Aplicação sem intercorrências',
    status: VaccineApplicationStatusEnum.APPLIED,
    createdAt: '2024-10-15T10:00:00Z',
    updatedAt: '2024-10-15T10:00:00Z',
  },
  {
    id: 'a2',
    userId: '4',
    user: mockUsers[3],
    vaccineId: 'v4',
    vaccine: mockVaccines[3],
    batchId: 'b1',
    batch: mockVaccineBatches[0],
    nurseId: '5',
    nurse: mockUsers[4],
    applicationDate: '2024-09-20T14:00:00Z',
    doseNumber: 1,
    applicationSite: 'Braço esquerdo',
    observations: 'Paciente apresentou leve vermelhidão local',
    status: VaccineApplicationStatusEnum.APPLIED,
    createdAt: '2024-09-20T14:00:00Z',
    updatedAt: '2024-09-20T14:00:00Z',
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    userId: '1',
    type: NotificationTypeEnum.SCHEDULING_CONFIRMED,
    title: 'Agendamento Confirmado',
    message: 'Sua vacina contra gripe foi agendada para 20/11/2024 às 10:00',
    isRead: false,
    readAt: null,
    metadata: { schedulingId: 's1' },
    createdAt: '2024-11-01T00:00:00Z',
  },
  {
    id: 'n2',
    userId: '1',
    type: NotificationTypeEnum.SCHEDULING_REMINDER,
    title: 'Lembrete de Vacina',
    message: 'Sua vacina COVID-19 está agendada para amanhã às 14:00',
    isRead: false,
    readAt: null,
    metadata: { schedulingId: 's2' },
    createdAt: '2024-11-15T00:00:00Z',
  },
  {
    id: 'n3',
    userId: '2',
    type: NotificationTypeEnum.SYSTEM_ANNOUNCEMENT,
    title: 'Novos Agendamentos',
    message: 'Você tem 3 novos agendamentos para hoje',
    isRead: true,
    readAt: '2024-11-16T08:00:00Z',
    createdAt: '2024-11-16T00:00:00Z',
  },
  {
    id: 'n4',
    userId: '3',
    type: NotificationTypeEnum.VACCINE_DOSE_DUE,
    title: 'Lote Próximo ao Vencimento',
    message: 'O lote COV2024001 vence em 30 dias',
    isRead: false,
    readAt: null,
    metadata: { batchId: 'b2' },
    createdAt: '2024-11-16T00:00:00Z',
  },
];

// Helper function to get user by credentials
export const authenticateUser = (
  email: string,
  password: string
): MockUser | null => {
  const user = mockUsers.find(
    (u) => u.email === email && u.password === password
  );
  return user || null;
};

// Helper function to get users without password
export const getUsersWithoutPassword = (): User[] => {
  return mockUsers.map(({ password, ...user }) => user);
};
