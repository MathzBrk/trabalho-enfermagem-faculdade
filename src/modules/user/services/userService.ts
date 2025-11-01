import { UserStore } from "@modules/user/stores/userStore";
import { hashPassword } from "@shared/helpers/passwordHelper";
import type { CreateUserDTO, UserResponse } from "@shared/models/user";
import dayjs from "dayjs";

/**
 * UserService - Service layer for user business logic
 *
 * Responsible for:
 * - User creation with validation
 * - Business rules enforcement
 * - Data transformation and sanitization
 * - Orchestrating store operations
 *
 * This service handles all business logic related to users,
 * keeping the controller thin and focused on HTTP concerns.
 */
export class UserService {
  private userStore: UserStore;

  constructor() {
    this.userStore = new UserStore();
  }

  /**
   * Creates a new user in the system
   *
   * Business rules enforced:
   * - Email must be unique
   * - CPF must be unique
   * - NURSE role requires a unique COREN
   * - Password is hashed before storage
   * - Response excludes sensitive data (password)
   *
   * @param data - User creation data
   * @returns User object without password
   * @throws Error if validation fails or duplicate data exists
   *
   * @example
   * const user = await userService.createUser({
   *   name: "João Silva",
   *   email: "joao@example.com",
   *   password: "securepass123",
   *   cpf: "12345678900",
   *   role: "EMPLOYEE"
   * });
   */
  async createUser(data: CreateUserDTO): Promise<UserResponse> {
    try {
      const emailExists = await this.userStore.emailExists(data.email);
      if (emailExists) {
        throw new Error("Email already registered");
      }

      const cpfExists = await this.userStore.cpfExists(data.cpf);
      if (cpfExists) {
        throw new Error("CPF already registered");
      }

      if (data.role === "NURSE") {
        if (!data.coren) {
          throw new Error("COREN is required for NURSE role");
        }

        const corenExists = await this.userStore.corenExists(data.coren);
        if (corenExists) {
          throw new Error("COREN already registered");
        }
      }

      const hashedPassword = await hashPassword(data.password);

      const user = await this.userStore.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        cpf: data.cpf,
        phone: data.phone,
        role: data.role,
        coren: data.coren,
        updatedAt: dayjs().toDate(),
      });

      return {
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone,
        role: user.role,
        coren: user.coren,
        id: user.id,
        isActive: user.isActive,
        updatedAt: user.updatedAt,
        createdAt: user.createdAt,
      };
    } catch (error) {
      console.log('Error creating user:', error);
      throw error;
    }
  }
}
