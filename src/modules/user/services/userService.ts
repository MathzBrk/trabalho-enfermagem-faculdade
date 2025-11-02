import { IUserStore } from "@shared/interfaces/user";
import { hashPassword } from "@shared/helpers/passwordHelper";
import { normalizeEmail, toUserResponse } from "@shared/helpers/userHelper";
import type { CreateUserDTO, UserResponse } from "@shared/models/user";
import dayjs from "dayjs";
import { CORENAlreadyExistsError, CPFAlreadyExistsError, EmailAlreadyExistsError, ValidationError } from "../errors";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "@infrastructure/di/tokens";

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
 *
 * Dependencies:
 * - IUserStore: Injected via constructor for data access operations
 *   Allows switching between Prisma (production) and Mock (testing)
 */
@injectable()
export class UserService {
  constructor(
    @inject(TOKENS.IUserStore) private readonly userStore: IUserStore
  ) {}

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
      await this.validateUserUniqueness(data);

      const hashedPassword = await hashPassword(data.password);

      const user = await this.userStore.create({
        name: data.name,
        email: normalizeEmail(data.email),
        password: hashedPassword,
        cpf: data.cpf,
        phone: data.phone,
        role: data.role,
        coren: data.coren,
        updatedAt: dayjs().toDate(),
      });

      return toUserResponse(user);
    } catch (error) {
      console.log('Error creating user:', error);
      throw error;
    }
  }

  private async validateUserUniqueness(data: CreateUserDTO): Promise<void> {
    const normalizedEmail = normalizeEmail(data.email);
    const emailExists = await this.userStore.emailExists(normalizedEmail);
    if (emailExists) {
      throw new EmailAlreadyExistsError();
    }

    const cpfExists = await this.userStore.cpfExists(data.cpf);
    if (cpfExists) {
      throw new CPFAlreadyExistsError();
    }

    if (data.role === "NURSE") {
      if (!data.coren) {
        throw new ValidationError("COREN is required for NURSE role");
      }

      const corenExists = await this.userStore.corenExists(data.coren);
      if (corenExists) {
        throw new CORENAlreadyExistsError();
      }
    }
  }
}
