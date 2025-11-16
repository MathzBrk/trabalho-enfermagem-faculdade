import { AppError } from '@modules/user/errors';

export class VaccineSchedulingNotFoundError extends AppError {
  constructor(message = 'Vaccine scheduling not found') {
    super(message, 404);
    this.name = 'VaccineSchedulingNotFoundError';
  }
}

export class UnauthorizedSchedulingAccessError extends AppError {
  constructor(message = 'You can only manage your own vaccine schedules') {
    super(message, 403);
    this.name = 'UnauthorizedSchedulingAccessError';
  }
}

export class InvalidSchedulingDateError extends AppError {
  constructor(message = 'Scheduled date must be in the future') {
    super(message, 400);
    this.name = 'InvalidSchedulingDateError';
  }
}

export class SchedulingAlreadyCompletedError extends AppError {
  constructor(message = 'Cannot modify a completed scheduling') {
    super(message, 400);
    this.name = 'SchedulingAlreadyCompletedError';
  }
}

export class InvalidDoseNumberError extends AppError {
  constructor(vaccineId: string, maxDoses: number) {
    super(
      `Dose number exceeds vaccine requirements. Vaccine ${vaccineId} requires only ${maxDoses} doses`,
      400,
    );
    this.name = 'InvalidDoseNumberError';
  }
}

export class MissingPreviousDoseError extends AppError {
  constructor(
    message = 'Previous dose is missing for this vaccine scheduling',
  ) {
    super(message, 400);
    this.name = 'MissingPreviousDoseError';
  }
}

export class DuplicateSchedulingError extends AppError {
  constructor(
    message = 'A scheduling for this vaccine and dose already exists',
  ) {
    super(message, 409);
    this.name = 'DuplicateSchedulingError';
  }
}
