import type {
  User as PrismaUser,
  Role,
  Prisma,
} from '@infrastructure/database';

/**
 * User model type from Prisma
 */
export type User = PrismaUser;

/**
 * User roles available in the system
 */
export type UserRole = Role;

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

/**
 * DTO for updating user information
 * All fields are optional as partial updates are supported
 */
export interface UpdateUserDTO {
  name?: string;
  phone?: string;
  isActive?: boolean; // Only MANAGER can update
  role?: Role; // Only MANAGER can update
  coren?: string;
}

/**
 * Request params for getting user by ID
 */
export interface GetUserByIdParams {
  id: string;
}

/**
 * Request params for deleting a user
 */
export interface DeleteUserParams {
  id: string;
}

export type UserCreateInput = Prisma.UserCreateInput;
export type UserUpdateInput = Prisma.UserUpdateInput;
export type UserDelegate = Prisma.UserDelegate;
