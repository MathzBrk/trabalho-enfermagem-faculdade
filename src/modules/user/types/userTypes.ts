import { UserRole } from "@shared/models/user";

export interface GetUsersQueryParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  role?: UserRole;
  isActive?: boolean;
  excludeDeleted?: boolean;
}