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

export const NotificationType = {
  SCHEDULING_CONFIRMED: 'SCHEDULING_CONFIRMED',
  SCHEDULING_CANCELLED: 'SCHEDULING_CANCELLED',
  SCHEDULING_REMINDER: 'SCHEDULING_REMINDER',
  VACCINE_DOSE_DUE: 'VACCINE_DOSE_DUE',
  SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT',
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

// ==================== Base Types ====================

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone?: string | null;
  role: UserRole;
  coren?: string | null;
  isActive?: boolean;
  profilePhotoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const VaccineBatchStatus = {
  AVAILABLE: 'AVAILABLE',
  EXPIRED: 'EXPIRED',
  DEPLETED: 'DEPLETED',
  DISCARDED: 'DISCARDED',
} as const;

export type VaccineBatchStatus = (typeof VaccineBatchStatus)[keyof typeof VaccineBatchStatus];

export interface Vaccine {
  id: string;
  name: string;
  manufacturer: string;
  description?: string | null;
  dosesRequired: number;
  intervalDays?: number | null;
  minStockLevel?: number | null;
  totalStock: number;
  isObligatory: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaccineBatch {
  id: string;
  vaccineId: string;
  vaccine?: Vaccine;
  batchNumber: string;
  initialQuantity: number;
  currentQuantity: number;
  expirationDate: string;
  receivedDate: string;
  status: VaccineBatchStatus;
  createdById: string;
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
  appliedById: string;
  appliedBy?: User;
  schedulingId?: string | null;
  scheduling?: VaccineScheduling;
  applicationDate: string;
  doseNumber: number;
  applicationSite: string;
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  user?: User;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
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
  phone?: string;
  role: UserRole;
  coren?: string;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  isActive?: boolean;
  role?: UserRole;
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

// Scheduled application (Type A)
export interface CreateScheduledApplicationData {
  schedulingId: string;
  batchId: string;
  applicationSite: string;
  observations?: string;
}

// Walk-in application (Type B)
export interface CreateWalkInApplicationData {
  receivedById: string;
  vaccineId: string;
  doseNumber: number;
  batchId: string;
  applicationSite: string;
  observations?: string;
}

// Union type for application creation
export type CreateVaccineApplicationData =
  | CreateScheduledApplicationData
  | CreateWalkInApplicationData;

// Update application data
export interface UpdateVaccineApplicationData {
  applicationSite?: string;
  observations?: string;
}

export interface CreateVaccineData {
  name: string;
  manufacturer: string;
  description?: string;
  dosesRequired: number;
  isObligatory: boolean;
  intervalDays?: number;
  minStockLevel?: number;
}

export interface UpdateVaccineData {
  name?: string;
  manufacturer?: string;
  description?: string;
  dosesRequired?: number;
  isObligatory?: boolean;
  intervalDays?: number;
  minStockLevel?: number;
}

export interface CreateVaccineBatchData {
  vaccineId: string;
  batchNumber: string;
  quantity: number;
  expirationDate: string;
  receivedDate?: string;
}

export interface UpdateVaccineBatchData {
  batchNumber?: string;
  quantity?: number;
  expirationDate?: string;
  receivedDate?: string;
  status?: VaccineBatchStatus;
}

// ==================== API Response Types ====================

export interface AuthResponse {
  success?: boolean;
  data?: {
    token: string;
    user: User;
    expiresIn?: string;
  };
  token?: string;
  user?: User;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface NotificationPagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ListNotificationsParams {
  page?: number;
  perPage?: number;
  isRead?: boolean;
  type?: NotificationType;
}

export interface ListNotificationsResponse {
  data: Notification[];
  pagination: NotificationPagination;
}

export interface MarkAllAsReadResponse {
  count: number;
}

export interface ListVaccinesParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  manufacturer?: string;
  isObligatory?: boolean;
}

export interface ListVaccineBatchesParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: VaccineBatchStatus;
  expiringBefore?: string;
  expiringAfter?: string;
  minQuantity?: number;
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

// ==================== Vaccine Application Types ====================

export interface ListVaccineApplicationsParams {
  page?: number;
  perPage?: number;
  sortBy?: 'applicationDate' | 'doseNumber' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  userId?: string;
  vaccineId?: string;
  appliedById?: string;
  batchId?: string;
  doseNumber?: number;
}

export interface ListVaccineApplicationsResponse extends PaginatedResponse<VaccineApplication> {}

// ==================== Vaccination History Types ====================

export interface VaccinationHistorySummary {
  totalVaccinesApplied: number;
  totalVaccinesCompleted: number;
  totalMandatoryPending: number;
  totalDosesPending: number;
  compliancePercentage: number;
}

export interface DoseApplication {
  id: string;
  doseNumber: number;
  applicationDate: string;
  applicationSite: string;
  observations?: string | null;
  batchId: string;
  appliedById: string;
  batch: {
    id: string;
    batchNumber: string;
    expirationDate: string;
  };
  appliedBy: {
    id: string;
    name: string;
    email: string;
    coren?: string | null;
  };
}

export interface VaccineWithDoses {
  vaccine: {
    id: string;
    name: string;
    manufacturer: string;
    dosesRequired: number;
    intervalDays: number | null;
    isObligatory: boolean;
  };
  doses: DoseApplication[];
  isComplete: boolean;
  completionPercentage: number;
  totalDosesRequired: number;
  dosesApplied: number;
}

export interface AppliedVaccine {
  id: string;
  vaccineId: string;
  doseNumber: number;
  applicationDate: string;
  applicationSite: string;
  observations?: string | null;
}

export interface MandatoryVaccineNotTaken {
  id: string;
  name: string;
  manufacturer: string;
  dosesRequired: number;
  intervalDays: number | null;
  isObligatory: boolean;
}

export interface PendingDose {
  vaccine: {
    id: string;
    name: string;
    manufacturer: string;
    dosesRequired: number;
    intervalDays: number | null;
    isObligatory: boolean;
  };
  currentDose: number;
  nextDose: number;
  expectedDate: string;
}

export interface VaccinationHistory {
  issuedAt: string;
  summary: VaccinationHistorySummary;
  vaccinesByType: VaccineWithDoses[];
  applied: AppliedVaccine[];
  mandatoryNotTaken: MandatoryVaccineNotTaken[];
  pendingDoses: PendingDose[];
}
