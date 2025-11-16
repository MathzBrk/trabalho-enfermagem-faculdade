import { AppError } from '@modules/user/errors';

export class VaccineApplicationNotFoundError extends AppError {
  constructor(message = 'Vaccine application not found') {
    super(message, 404);
    this.name = 'VaccineApplicationNotFoundError';
  }
}

export class DuplicateDoseError extends AppError {
  constructor(userId: string, vaccineId: string, doseNumber: number) {
    super(
      `User ${userId} already received dose ${doseNumber} of vaccine ${vaccineId}`,
      409,
    );
    this.name = 'DuplicateDoseError';
  }
}

export class InsufficientBatchQuantityError extends AppError {
  constructor(
    message = 'Batch has insufficient quantity for this application',
  ) {
    super(message, 400);
    this.name = 'InsufficientBatchQuantityError';
  }
}

export class InvalidDoseSequenceError extends AppError {
  constructor(
    message = 'Dose sequence is invalid. Previous doses must be applied first',
  ) {
    super(message, 400);
    this.name = 'InvalidDoseSequenceError';
  }
}

export class MinimumIntervalNotMetError extends AppError {
  constructor(requiredDays: number, daysSinceLastDose: number) {
    super(
      `Minimum interval of ${requiredDays} days not met. Only ${daysSinceLastDose} days have passed since last dose`,
      400,
    );
    this.name = 'MinimumIntervalNotMetError';
  }
}

export class BatchNotAvailableError extends AppError {
  constructor(message = 'Batch is not available for use') {
    super(message, 400);
    this.name = 'BatchNotAvailableError';
  }
}

export class ExceededRequiredDosesError extends AppError {
  constructor(vaccineId: string, requiredDoses: number) {
    super(
      `Cannot apply more doses than required. Vaccine ${vaccineId} requires only ${requiredDoses} doses`,
      400,
    );
    this.name = 'ExceededRequiredDosesError';
  }
}

export class UnauthorizedApplicationUpdateError extends AppError {
  constructor(
    message = 'Only the nurse who applied this vaccine or a manager can update it',
  ) {
    super(message, 403);
    this.name = 'UnauthorizedApplicationUpdateError';
  }
}
