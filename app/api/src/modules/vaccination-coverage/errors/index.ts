import { AppError } from '@modules/user/errors';

export class InvalidPorcentageError extends AppError {
  constructor(percentage: number) {
    super(`Invalid percentage: ${percentage}`, 400);
    this.name = 'InvalidPorcentageError';
  }
}
