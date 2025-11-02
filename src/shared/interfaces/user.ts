import { User, Prisma } from "@infrastructure/database";
import { IBaseStore } from "@shared/stores/baseStore";

/**
 * IUserStore Interface
 *
 * Defines the contract for user data access operations.
 * Extends IBaseStore to inherit standard CRUD operations:
 * - findById(id)
 * - findAll()
 * - create(data)
 * - update(id, data)
 * - delete(id)
 * - softDelete(id)
 * - count(where?)
 * - exists(where)
 *
 * Adds user-specific query methods for business logic needs.
 * This interface enables dependency injection and allows for
 * multiple implementations (Prisma, in-memory, etc.).
 */
export interface IUserStore extends IBaseStore<User, Prisma.UserCreateInput, Prisma.UserUpdateInput> {
    findByEmail(email: string): Promise<User | null>;
    findByCPF(cpf: string): Promise<User | null>;
    findByCOREN(coren: string): Promise<User | null>;
    findByRole(role: "EMPLOYEE" | "NURSE" | "MANAGER"): Promise<User[]>;
    findAllActive(): Promise<User[]>;
    findActiveNurses(): Promise<User[]>;
    findActiveManagers(): Promise<User[]>;
    findByIdWithRelations(id: string): Promise<User | null>;
    emailExists(email: string): Promise<boolean>;
    cpfExists(cpf: string): Promise<boolean>;
    corenExists(coren: string): Promise<boolean>;
    updatePassword(id: string, hashedPassword: string): Promise<User>;
    toggleActive(id: string, isActive: boolean): Promise<User>;
    countByRole(role: "EMPLOYEE" | "NURSE" | "MANAGER"): Promise<number>;
    countActive(): Promise<number>;
}