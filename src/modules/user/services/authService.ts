import dayjs from "dayjs";
import { comparePassword, hashPassword } from "@shared/helpers/passwordHelper";
import { UserStore } from "../stores/userStore";
import { User } from "@infrastructure/database";
import type { TokenPayload } from "../../../@types/express";
import { generateToken } from "@shared/helpers/tokenHelper";
import {
  InvalidCredentialsError,
  EmailAlreadyExistsError,
  CPFAlreadyExistsError,
  CORENAlreadyExistsError,
  ValidationError
} from "../errors";
import type { AuthResponse, UserResponse } from "../types/authTypes";
import type { RegisterDTO } from "../validators/registerValidator";

export class AuthService {
  private userStore: UserStore;

  constructor() {
    this.userStore = new UserStore();
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const normalizedEmail = email.toLowerCase().trim();

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
      user: this.sanitizeUser(user),
      token,
      expiresIn: '7d'
    };
  }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    await this.validateRegistration(data);

    const hashedPassword = await hashPassword(data.password);

    const user = await this.userStore.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      cpf: data.cpf,
      phone: data.phone,
      role: data.role,
      coren: data.coren,
      isActive: true,
      updatedAt: dayjs().toDate(),
    });

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
      expiresIn: '7d'
    };
  }

  private async validateRegistration(data: RegisterDTO): Promise<void> {
    if (await this.userStore.emailExists(data.email.toLowerCase().trim())) {
      throw new EmailAlreadyExistsError();
    }

    if (await this.userStore.cpfExists(data.cpf)) {
      throw new CPFAlreadyExistsError();
    }

    if (data.role === 'NURSE') {
      if (!data.coren) {
        throw new ValidationError('COREN is required for NURSE role');
      }
      if (await this.userStore.corenExists(data.coren)) {
        throw new CORENAlreadyExistsError();
      }
    }
  }

  private generateToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      iat: Math.floor(Date.now() / 1000)
    };

    return generateToken(payload, '7d');
  }

  private sanitizeUser(user: User): UserResponse {
    const { password, ...safeUser } = user;
    return safeUser;
  }
}