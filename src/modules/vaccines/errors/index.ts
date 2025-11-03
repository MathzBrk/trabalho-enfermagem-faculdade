import { AppError, ValidationError } from '@modules/user/errors';

/**
 * VaccineAlreadyExistsError
 *
 * Thrown when attempting to create a vaccine that already exists
 * (duplicate name + manufacturer combination).
 *
 * This error extends ValidationError (400) because it's a validation issue
 * that should be caught before attempting database operations.
 */
export class VaccineAlreadyExistsError extends ValidationError {
  constructor(name: string, manufacturer: string) {
    super(
      `Vaccine "${name}" from manufacturer "${manufacturer}" already exists`,
    );
    this.name = 'VaccineAlreadyExistsError';
  }
}

/**
 * VaccineNotFoundError
 *
 * Thrown when a requested vaccine cannot be found in the database.
 */
export class VaccineNotFoundError extends AppError {
  constructor(message: string = 'Vaccine not found') {
    super(message, 404);
    this.name = 'VaccineNotFoundError';
  }
}

/**
 * InsufficientStockError
 *
 * Thrown when attempting to use a vaccine but there's insufficient stock available.
 */
export class InsufficientStockError extends AppError {
  constructor(message: string = 'Insufficient vaccine stock') {
    super(message, 400);
    this.name = 'InsufficientStockError';
  }
}
