import { User, UserResponse } from "@shared/models/user";

export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const toUserResponse = (user: User): UserResponse => {
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
};