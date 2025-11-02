import { comparePassword } from "@shared/helpers/passwordHelper";
import { IUserStore } from "@shared/interfaces/user";
import { User } from "@infrastructure/database";
import type { TokenPayload } from "../../../@types/express";
import { generateToken } from "@shared/helpers/tokenHelper";
import type { AuthResponse } from "../types/authTypes";
import type { RegisterDTO } from "../validators/registerValidator";
import { UserService } from "./userService";
import { normalizeEmail, toUserResponse } from "@shared/helpers/userHelper";
import { InvalidCredentialsError } from "../errors";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "@infrastructure/di/tokens";

/**
 * AuthService - Service layer for authentication operations
 *
 * Handles:
 * - User login with credential validation
 * - User registration via UserService
 * - JWT token generation
 *
 * Dependencies:
 * - IUserStore: For direct user lookups during login
 * - UserService: For user creation during registration
 */
@injectable()
export class AuthService {
  constructor(
    @inject(TOKENS.IUserStore) private readonly userStore: IUserStore,
    private readonly userService: UserService
  ) {}

  async login(email: string, password: string): Promise<AuthResponse> {
    const normalizedEmail = normalizeEmail(email);

    const user = await this.userStore.findByEmail(normalizedEmail);

    if (!user || !user.isActive) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const token = this.generateToken(user);

    return {
      user: toUserResponse(user),
      token,
      expiresIn: '7d'
    };
  }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const user = await this.userService.createUser({
      ...data,
    });

    const token = this.generateToken(user);

    return {
      user,
      token,
      expiresIn: '7d'
    };
  }

  private generateToken(user: Omit<User, 'password' | 'deletedAt'>): string {
    const payload: TokenPayload = {
      userId: user.id,
      iat: Math.floor(Date.now() / 1000)
    };

    return generateToken(payload, '7d');
  }
}