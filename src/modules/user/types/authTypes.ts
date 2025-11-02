import { UserResponse } from '@shared/models/user';

export interface AuthResponse {
  user: UserResponse;
  token: string;
  expiresIn: string;
}
