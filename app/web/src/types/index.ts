// ==================== Enums (as const objects) ====================

export const UserRole = {
  EMPLOYEE: 'EMPLOYEE',
  NURSE: 'NURSE',
  MANAGER: 'MANAGER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const VaccineApplicationStatus = {
  SCHEDULED: 'SCHEDULED',
  APPLIED: 'APPLIED',
  MISSED: 'MISSED',
  CANCELLED: 'CANCELLED',
} as const;

export type VaccineApplicationStatus = (typeof VaccineApplicationStatus)[keyof typeof VaccineApplicationStatus];

export const NotificationPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type NotificationPriority = (typeof NotificationPriority)[keyof typeof NotificationPriority];

// ==================== Base Types ====================

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: UserRole;
  coren?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vaccine {
  id: string;
  name: string;
  manufacturer: string;
  description?: string;
  dosesRequired: number;
  intervalDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface VaccineBatch {
  id: string;
  vaccineId: string;
  vaccine?: Vaccine;
  batchNumber: string;
  manufacturingDate: string;
  expirationDate: string;
  quantity: number;
  availableQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface VaccineScheduling {
  id: string;
  userId: string;
  user?: User;
  vaccineId: string;
  vaccine?: Vaccine;
  assignedNurseId?: string;
  assignedNurse?: User;
  scheduledDate: string;
  doseNumber: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaccineApplication {
  id: string;
  userId: string;
  user?: User;
  vaccineId: string;
  vaccine?: Vaccine;
  batchId: string;
  batch?: VaccineBatch;
  nurseId: string;
  nurse?: User;
  schedulingId?: string;
  scheduling?: VaccineScheduling;
  applicationDate: string;
  doseNumber: number;
  applicationSite?: string;
  observations?: string;
  status: VaccineApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  user?: User;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ==================== API Request Types ====================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  cpf: string;
  role: UserRole;
  coren?: string;
}

export interface CreateVaccineSchedulingData {
  userId: string;
  vaccineId: string;
  assignedNurseId?: string;
  scheduledDate: string;
  doseNumber: number;
  notes?: string;
}

export interface CreateVaccineApplicationData {
  userId: string;
  vaccineId: string;
  batchId: string;
  nurseId: string;
  schedulingId?: string;
  applicationDate: string;
  doseNumber: number;
  applicationSite?: string;
  observations?: string;
  status: VaccineApplicationStatus;
}

export interface CreateVaccineData {
  name: string;
  manufacturer: string;
  description?: string;
  dosesRequired: number;
  intervalDays?: number;
}

export interface CreateVaccineBatchData {
  vaccineId: string;
  batchNumber: string;
  manufacturingDate: string;
  expirationDate: string;
  quantity: number;
}

// ==================== API Response Types ====================

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// ==================== UI State Types ====================

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface DashboardStats {
  totalEmployees?: number;
  totalVaccines?: number;
  monthlyApplications?: number;
  expiringBatches?: number;
  upcomingSchedules?: number;
  pendingApplications?: number;
}

// ==================== Mock Data Types ====================

export interface MockUser extends User {
  password: string;
}
