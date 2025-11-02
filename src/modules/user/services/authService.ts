import { comparePassword } from "@shared/helpers/passwordHelper";
import { UserStore } from "../stores/userStore";
import { User } from "@infrastructure/database";
import type { TokenPayload } from "../../../@types/express";
import { generateToken } from "@shared/helpers/tokenHelper";
import type { AuthResponse } from "../types/authTypes";
import type { RegisterDTO } from "../validators/registerValidator";
import { UserService } from "./userService";
import { normalizeEmail, toUserResponse } from "@shared/helpers/userHelper";
import { InvalidCredentialsError } from "../errors";

export class AuthService {
  private userStore: UserStore;
  private userService: UserService;

  constructor() {
    this.userStore = new UserStore();
    this.userService = new UserService();
  }

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
      email: data.email,
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