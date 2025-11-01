import type { User as PrismaUser, Role } from "@infrastructure/database";

/**
 * User model type from Prisma
 */
export type User = PrismaUser;

/**
 * User roles available in the system
 */
export enum UserRole {
  EMPLOYEE = "EMPLOYEE",
  NURSE = "NURSE",
  MANAGER = "MANAGER",
}

/**
 * DTO for creating a new user
 */
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  cpf: string;
  phone?: string;
  role: Role;
  coren?: string; // Required for NURSE role
}

/**
 * User response without sensitive data
 */
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string | null;
  role: Role;
  coren: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
