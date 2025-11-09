import { AppError } from '@modules/user/errors';

/**
 * BatchNumberAlreadyExistsError
 *
 * Thrown when attempting to create a vaccine batch with a batch number
 * that already exists in the system. Batch numbers must be unique.
 *
 * This error extends ValidationError (400) because it's a validation issue
 * that should be caught before attempting database operations.
 */
export class BatchNumberAlreadyExistsError extends AppError {
  constructor(batchNumber: string) {
    super(`Batch number "${batchNumber}" already exists`, 409);
    this.name = 'BatchNumberAlreadyExistsError';
  }
}

/**
 * VaccineBatchNotFoundError
 *
 * Thrown when a requested vaccine batch cannot be found in the database.
 */
export class VaccineBatchNotFoundError extends AppError {
  constructor(message: string = 'Vaccine batch not found') {
    super(message, 404);
    this.name = 'VaccineBatchNotFoundError';
  }
}

/**
 * InvalidBatchQuantityError
 *
 * Thrown when attempting to create or update a batch with invalid quantity
 * (e.g., negative numbers, zero, or insufficient stock for operations).
 */
export class InvalidBatchQuantityError extends AppError {
  constructor(message: string = 'Invalid batch quantity') {
    super(message, 400);
    this.name = 'InvalidBatchQuantityError';
  }
}

/**
 * ExpiredBatchError
 *
 * Thrown when attempting to create a batch with an expiration date
 * that is in the past, or when trying to use an already expired batch.
 */
export class ExpiredBatchError extends AppError {
  constructor(
    message: string = 'Batch has expired or expiration date is invalid',
  ) {
    super(message, 400);
    this.name = 'ExpiredBatchError';
  }
}
