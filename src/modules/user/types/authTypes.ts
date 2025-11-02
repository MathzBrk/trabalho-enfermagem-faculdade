import { User } from '@infrastructure/database';

export interface UserResponse extends Omit<User, 'password'> {}

export interface AuthResponse {
  user: UserResponse;
  token: string;
  expiresIn: string;
}
